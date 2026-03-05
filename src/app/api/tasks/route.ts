import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Get today's submission status for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        userId: session.user.id,
        submittedAt: {
          gte: today,
        },
      },
    });

    const submissionMap = new Map(
      submissions.map((s) => [s.taskId, s.status])
    );

    const tasksWithStatus = tasks.map((task) => ({
      ...task,
      status: submissionMap.get(task.id) || null,
    }));

    return NextResponse.json(tasksWithStatus);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
