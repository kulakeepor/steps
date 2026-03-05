import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { amount, reason } = await request.json();

    if (typeof amount !== "number") {
      return NextResponse.json(
        { error: "Amount must be a number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user steps
    const updated = await prisma.user.update({
      where: { id },
      data: {
        steps: { increment: amount },
      },
      select: {
        id: true,
        name: true,
        email: true,
        steps: true,
        role: true,
        status: true,
      },
    });

    // Create transaction record
    await prisma.stepTransaction.create({
      data: {
        userId: id,
        amount,
        type: amount > 0 ? TransactionType.EARN : TransactionType.REDEEM,
        description: reason || (amount > 0 ? "管理员增加积分" : "管理员扣减积分"),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: id,
        title: amount > 0 ? "积分已增加" : "积分已扣减",
        message: `管理员${amount > 0 ? "增加" : "扣减"}了 ${Math.abs(amount)} STEPs${reason ? `: ${reason}` : ""}`,
        type: "INFO",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adjusting user steps:", error);
    return NextResponse.json(
      { error: "Failed to adjust steps" },
      { status: 500 }
    );
  }
}
