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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Toggle between SHIPPED and COMPLETED
    if (order.status === OrderStatus.SHIPPED) {
      // Confirm receipt - change to COMPLETED
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    } else if (order.status === OrderStatus.COMPLETED) {
      // Revert to SHIPPED (cancel confirmation)
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.SHIPPED,
          completedAt: null,
        },
      });
      return NextResponse.json(updated);
    } else {
      return NextResponse.json(
        { error: "Order status must be SHIPPED or COMPLETED" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 }
    );
  }
}
