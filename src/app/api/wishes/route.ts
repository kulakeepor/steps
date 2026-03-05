import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

// GET: 获取当前用户的许愿列表
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishes = await prisma.wish.findMany({
      where: { userId: session.user.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(wishes);
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishes" },
      { status: 500 }
    );
  }
}

// POST: 创建新许愿
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemName, stepsCost } = await request.json();

    if (!itemName || !stepsCost || stepsCost <= 0) {
      return NextResponse.json(
        { error: "Invalid wish data" },
        { status: 400 }
      );
    }

    // 获取用户当前积分
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.steps < stepsCost) {
      return NextResponse.json(
        { error: "积分不足" },
        { status: 400 }
      );
    }

    // 创建许愿并扣除积分
    const [wish] = await prisma.$transaction([
      // 创建许愿
      prisma.wish.create({
        data: {
          userId: session.user.id,
          itemName,
          stepsCost,
        },
      }),
      // 扣除积分
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          steps: {
            decrement: stepsCost,
          },
        },
      }),
      // 创建交易记录
      prisma.stepTransaction.create({
        data: {
          userId: session.user.id,
          amount: -stepsCost,
          type: TransactionType.REDEEM,
          description: `许愿: ${itemName}`,
        },
      }),
    ]);

    return NextResponse.json(wish);
  } catch (error) {
    console.error("Error creating wish:", error);
    return NextResponse.json(
      { error: "Failed to create wish" },
      { status: 500 }
    );
  }
}
