import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

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

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== OrderStatus.APPROVED && order.status !== OrderStatus.SHIPPED) {
      return NextResponse.json(
        { error: "Order must be APPROVED or SHIPPED" },
        { status: 400 }
      );
    }

    // Toggle between APPROVED and SHIPPED
    if (order.status === OrderStatus.APPROVED) {
      // Mark as shipped
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.SHIPPED,
          shippedAt: new Date(),
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "商品已发货",
          message: `您的商品 "${order.product.name}" 已发货，请查收`,
          type: "SHIPMENT",
        },
      });

      return NextResponse.json(updated);
    } else {
      // Cancel shipping - revert to APPROVED
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.APPROVED,
          shippedAt: null,
        },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error shipping order:", error);
    return NextResponse.json(
      { error: "Failed to ship order" },
      { status: 500 }
    );
  }
}
