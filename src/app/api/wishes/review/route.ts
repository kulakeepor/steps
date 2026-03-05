import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishStatus, TransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wishId, approved } = await request.json();

    if (!wishId || approved === undefined) {
      return NextResponse.json(
        { error: "Wish ID and approval status are required" },
        { status: 400 }
      );
    }

    // Get wish with user
    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
      include: {
        user: true,
      },
    });

    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    if (wish.status !== WishStatus.PENDING) {
      return NextResponse.json(
        { error: "Wish already reviewed" },
        { status: 400 }
      );
    }

    if (approved) {
      // Approve wish - just update status, steps already deducted
      const updated = await prisma.wish.update({
        where: { id: wishId },
        data: {
          status: WishStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: wish.userId,
          title: "许愿已通过",
          message: `您的许愿 "${wish.itemName}" 已通过审核，请等待后续安排`,
          type: "WISH",
        },
      });

      return NextResponse.json(updated);
    } else {
      // Reject wish - refund steps
      await prisma.$transaction([
        // Update wish status
        prisma.wish.update({
          where: { id: wishId },
          data: {
            status: WishStatus.REJECTED,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
        // Refund steps to user
        prisma.user.update({
          where: { id: wish.userId },
          data: {
            steps: {
              increment: wish.stepsCost,
            },
          },
        }),
        // Create refund transaction
        prisma.stepTransaction.create({
          data: {
            userId: wish.userId,
            amount: wish.stepsCost,
            type: TransactionType.REFUND,
            description: `许愿退款: ${wish.itemName}`,
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: wish.userId,
            title: "许愿未通过",
            message: `您的许愿 "${wish.itemName}" 未通过审核，积分已退回`,
            type: "WISH",
          },
        }),
      ]);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error reviewing wish:", error);
    return NextResponse.json(
      { error: "Failed to review wish" },
      { status: 500 }
    );
  }
}
