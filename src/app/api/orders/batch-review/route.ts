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

    const { orderIds, approved } = await request.json();

    if (!Array.isArray(orderIds) || approved === undefined) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Get all orders with products and users
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        status: OrderStatus.PENDING,
      },
      include: {
        product: true,
        user: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: "No valid orders found" }, { status: 404 });
    }

    if (approved) {
      // Approve all orders
      await prisma.$transaction([
        // Update order status
        prisma.order.updateMany({
          where: { id: { in: orders.map((o) => o.id) } },
          data: {
            status: OrderStatus.APPROVED,
            reviewedAt: new Date(),
          },
        }),
        // Create notifications
        prisma.notification.createMany({
          data: orders.map((order) => ({
            userId: order.userId,
            title: "兑换申请已通过",
            message: `您的兑换申请 "${order.product.name}" 已通过审核，等待发货`,
            type: "ORDER",
          })),
        }),
      ]);

      return NextResponse.json({ success: true, count: orders.length });
    } else {
      // Reject all orders - refund steps and restore stock
      await prisma.$transaction([
        // Update order status
        prisma.order.updateMany({
          where: { id: { in: orders.map((o) => o.id) } },
          data: {
            status: OrderStatus.REJECTED,
            reviewedAt: new Date(),
          },
        }),
        // Refund steps to users
        ...orders.map((order) =>
          prisma.user.update({
            where: { id: order.userId },
            data: { steps: { increment: order.stepsCost } },
          })
        ),
        // Restore product stock
        ...orders.map((order) =>
          prisma.product.update({
            where: { id: order.productId },
            data: { stock: { increment: 1 } },
          })
        ),
        // Create refund transactions
        prisma.stepTransaction.createMany({
          data: orders.map((order) => ({
            userId: order.userId,
            amount: order.stepsCost,
            type: TransactionType.REFUND,
            description: `订单退款: ${order.product.name}`,
          })),
        }),
        // Create notifications
        prisma.notification.createMany({
          data: orders.map((order) => ({
            userId: order.userId,
            title: "兑换申请未通过",
            message: `您的兑换申请 "${order.product.name}" 未通过审核，积分已退回`,
            type: "ORDER",
          })),
        }),
      ]);

      return NextResponse.json({ success: true, count: orders.length });
    }
  } catch (error) {
    console.error("Error batch reviewing orders:", error);
    return NextResponse.json(
      { error: "Failed to batch review orders" },
      { status: 500 }
    );
  }
}
