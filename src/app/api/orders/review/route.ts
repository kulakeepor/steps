import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, approved } = await request.json();

    if (!orderId || approved === undefined) {
      return NextResponse.json(
        { error: "Order ID and approval status are required" },
        { status: 400 }
      );
    }

    // Get order with product and user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json(
        { error: "Order already reviewed" },
        { status: 400 }
      );
    }

    if (approved) {
      // Approve order
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.APPROVED,
          reviewedAt: new Date(),
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "兑换申请已通过",
          message: `您的兑换申请 "${order.product.name}" 已通过审核，等待发货`,
          type: "ORDER",
        },
      });

      return NextResponse.json(updated);
    } else {
      // Reject order - refund steps and restore stock
      await prisma.$transaction([
        // Update order status
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.REJECTED,
            reviewedAt: new Date(),
          },
        }),
        // Refund steps to user
        prisma.user.update({
          where: { id: order.userId },
          data: {
            steps: {
              increment: order.stepsCost,
            },
          },
        }),
        // Restore product stock
        prisma.product.update({
          where: { id: order.productId },
          data: {
            stock: {
              increment: 1,
            },
          },
        }),
        // Create refund transaction
        prisma.stepTransaction.create({
          data: {
            userId: order.userId,
            amount: order.stepsCost,
            type: TransactionType.REFUND,
            description: `订单退款: ${order.product.name}`,
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: order.userId,
            title: "兑换申请未通过",
            message: `您的兑换申请 "${order.product.name}" 未通过审核，积分已退回`,
            type: "ORDER",
          },
        }),
      ]);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error reviewing order:", error);
    return NextResponse.json(
      { error: "Failed to review order" },
      { status: 500 }
    );
  }
}
