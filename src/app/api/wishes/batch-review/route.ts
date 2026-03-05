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

    const { wishIds, approved } = await request.json();

    if (!Array.isArray(wishIds) || approved === undefined) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Get all wishes with users
    const wishes = await prisma.wish.findMany({
      where: {
        id: { in: wishIds },
        status: WishStatus.PENDING,
      },
      include: {
        user: true,
      },
    });

    if (wishes.length === 0) {
      return NextResponse.json({ error: "No valid wishes found" }, { status: 404 });
    }

    if (approved) {
      // Approve all wishes
      await prisma.$transaction([
        // Update wish status
        prisma.wish.updateMany({
          where: { id: { in: wishes.map((w) => w.id) } },
          data: {
            status: WishStatus.APPROVED,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
        // Create notifications
        prisma.notification.createMany({
          data: wishes.map((wish) => ({
            userId: wish.userId,
            title: "许愿已通过",
            message: `您的许愿 "${wish.itemName}" 已通过审核，请等待后续安排`,
            type: "WISH",
          })),
        }),
      ]);

      return NextResponse.json({ success: true, count: wishes.length });
    } else {
      // Reject all wishes - refund steps
      await prisma.$transaction([
        // Update wish status
        prisma.wish.updateMany({
          where: { id: { in: wishes.map((w) => w.id) } },
          data: {
            status: WishStatus.REJECTED,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
        // Refund steps to users
        ...wishes.map((wish) =>
          prisma.user.update({
            where: { id: wish.userId },
            data: { steps: { increment: wish.stepsCost } },
          })
        ),
        // Create refund transactions
        prisma.stepTransaction.createMany({
          data: wishes.map((wish) => ({
            userId: wish.userId,
            amount: wish.stepsCost,
            type: TransactionType.REFUND,
            description: `许愿退款: ${wish.itemName}`,
          })),
        }),
        // Create notifications
        prisma.notification.createMany({
          data: wishes.map((wish) => ({
            userId: wish.userId,
            title: "许愿未通过",
            message: `您的许愿 "${wish.itemName}" 未通过审核，积分已退回`,
            type: "WISH",
          })),
        }),
      ]);

      return NextResponse.json({ success: true, count: wishes.length });
    }
  } catch (error) {
    console.error("Error batch reviewing wishes:", error);
    return NextResponse.json(
      { error: "Failed to batch review wishes" },
      { status: 500 }
    );
  }
}
