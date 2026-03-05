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

    const { submissionIds, approved } = await request.json();

    if (!Array.isArray(submissionIds) || approved === undefined) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Get all submissions with their tasks and users
    const submissions = await prisma.taskSubmission.findMany({
      where: {
        id: { in: submissionIds },
        status: TaskStatus.PENDING,
      },
      include: {
        task: true,
        user: true,
      },
    });

    if (submissions.length === 0) {
      return NextResponse.json({ error: "No valid submissions found" }, { status: 404 });
    }

    // Process each submission
    const results = await prisma.$transaction(
      submissions.map((submission) =>
        prisma.taskSubmission.update({
          where: { id: submission.id },
          data: {
            status: approved ? TaskStatus.APPROVED : TaskStatus.REJECTED,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        })
      )
    );

    if (approved) {
      // Add steps and create notifications for all approved submissions
      await Promise.all([
        // Update user steps
        prisma.$transaction(
          submissions.map((s) =>
            prisma.user.update({
              where: { id: s.userId },
              data: { steps: { increment: s.task.stepsReward } },
            })
          )
        ),
        // Create transaction records
        prisma.stepTransaction.createMany({
          data: submissions.map((s) => ({
            userId: s.userId,
            amount: s.task.stepsReward,
            type: TransactionType.EARN,
            description: `任务奖励: ${s.task.name}`,
          })),
        }),
        // Create notifications
        prisma.notification.createMany({
          data: submissions.map((s) => ({
            userId: s.userId,
            title: "任务审核通过",
            message: `您的任务 "${s.task.name}" 已通过审核，获得 ${s.task.stepsReward} STEPs`,
            type: "TASK",
          })),
        }),
      ]);
    } else {
      // Create rejection notifications
      await prisma.notification.createMany({
        data: submissions.map((s) => ({
          userId: s.userId,
          title: "任务审核未通过",
          message: `您的任务 "${s.task.name}" 未通过审核，请重新提交`,
          type: "TASK",
        })),
      });
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error batch reviewing tasks:", error);
    return NextResponse.json(
      { error: "Failed to batch review tasks" },
      { status: 500 }
    );
  }
}
