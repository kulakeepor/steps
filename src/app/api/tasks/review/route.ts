import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, TransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, approved } = await request.json();

    if (!submissionId || approved === undefined) {
      return NextResponse.json(
        { error: "Submission ID and approval status are required" },
        { status: 400 }
      );
    }

    // Get submission with task and user
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== TaskStatus.PENDING) {
      return NextResponse.json(
        { error: "Submission already reviewed" },
        { status: 400 }
      );
    }

    const status = approved ? TaskStatus.APPROVED : TaskStatus.REJECTED;

    // Update submission
    const updated = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    // If approved, add steps to user
    if (approved) {
      await prisma.$transaction([
        // Add steps to user
        prisma.user.update({
          where: { id: submission.userId },
          data: {
            steps: {
              increment: submission.task.stepsReward,
            },
          },
        }),
        // Create transaction record
        prisma.stepTransaction.create({
          data: {
            userId: submission.userId,
            amount: submission.task.stepsReward,
            type: TransactionType.EARN,
            description: `任务奖励: ${submission.task.name}`,
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: submission.userId,
            title: "任务审核通过",
            message: `您的任务 "${submission.task.name}" 已通过审核，获得 ${submission.task.stepsReward} STEPs`,
            type: "TASK",
          },
        }),
      ]);
    } else {
      // Create rejection notification
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          title: "任务审核未通过",
          message: `您的任务 "${submission.task.name}" 未通过审核，请重新提交`,
          type: "TASK",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error reviewing task:", error);
    return NextResponse.json(
      { error: "Failed to review task" },
      { status: 500 }
    );
  }
}
