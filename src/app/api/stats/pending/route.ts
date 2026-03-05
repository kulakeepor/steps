import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, OrderStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pendingTasks, pendingOrders] = await Promise.all([
      prisma.taskSubmission.count({
        where: { status: TaskStatus.PENDING },
      }),
      prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
    ]);

    return NextResponse.json({
      pendingTasks,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
