import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if already submitted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSubmission = await prisma.taskSubmission.findUnique({
      where: {
        userId_taskId: {
          userId: session.user.id,
          taskId,
        },
      },
    });

    if (existingSubmission) {
      // Check if submitted today
      const submittedDate = new Date(existingSubmission.submittedAt);
      submittedDate.setHours(0, 0, 0, 0);

      if (submittedDate.getTime() === today.getTime()) {
        return NextResponse.json(
          { error: "今日已提交，请勿重复提交" },
          { status: 400 }
        );
      }

      // Create new submission for new day
      const submission = await prisma.taskSubmission.create({
        data: {
          userId: session.user.id,
          taskId,
          status: TaskStatus.PENDING,
        },
      });

      return NextResponse.json(submission);
    }

    // Create new submission
    const submission = await prisma.taskSubmission.create({
      data: {
        userId: session.user.id,
        taskId,
        status: TaskStatus.PENDING,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error submitting task:", error);
    return NextResponse.json(
      { error: "Failed to submit task" },
      { status: 500 }
    );
  }
}
