import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product and user in a transaction
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.steps < product.stepsPrice) {
      return NextResponse.json({ error: "Insufficient STEPs" }, { status: 400 });
    }

    // Create order and deduct steps in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          stepsCost: product.stepsPrice,
          status: OrderStatus.PENDING,
        },
      });

      // Deduct steps
      await tx.user.update({
        where: { id: user.id },
        data: {
          steps: {
            decrement: product.stepsPrice,
          },
        },
      });

      // Create transaction record
      await tx.stepTransaction.create({
        data: {
          userId: user.id,
          amount: -product.stepsPrice,
          type: TransactionType.REDEEM,
          description: `兑换商品: ${product.name}`,
        },
      });

      // Reduce stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return order;
    });

    // Return order with product info
    const orderWithProduct = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        product: true,
      },
    });

    return NextResponse.json(orderWithProduct);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
