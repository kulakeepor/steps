import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "default";

    const products = await prisma.product.findMany({
      where: { deleted: false },
      orderBy: getOrderBy(sort),
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function getOrderBy(sort: string) {
  switch (sort) {
    case "price-asc":
      return { stepsPrice: "asc" as const };
    case "price-desc":
      return { stepsPrice: "desc" as const };
    case "stock":
      return { stock: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}
