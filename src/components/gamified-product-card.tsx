"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Lock } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  image: string;
  stepsPrice: number;
  stock: number;
}

interface GamifiedProductCardProps {
  product: Product;
  canAfford: boolean;
  onRedeem: (product: Product) => void;
  userPoints?: number;
}

export function GamifiedProductCard({ product, canAfford, onRedeem, userPoints = 0 }: GamifiedProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isDisabled = isOutOfStock || !canAfford;

  return (
    <Card className={`overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${isDisabled ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Stock badge */}
        {!isOutOfStock && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={`text-xs font-medium ${
                product.stock > 10 ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
              }`}
            >
              {product.stock}
            </Badge>
          </div>
        )}

        {/* Sold out overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-medium px-3 py-1 bg-black/60 rounded-full">
              已售罄
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.25rem]">{product.name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <Coins className="w-3.5 h-3.5" />
            {product.stepsPrice}
          </div>

          {!canAfford && !isOutOfStock && userPoints > 0 && (
            <span className="text-xs text-muted-foreground">
              还需 {product.stepsPrice - userPoints}
            </span>
          )}
        </div>

        <Button
          onClick={() => onRedeem(product)}
          disabled={isDisabled}
          size="sm"
          className="w-full"
        >
          {isOutOfStock ? (
            <>
              <Lock className="w-3.5 h-3.5 mr-1" />
              已售罄
            </>
          ) : !canAfford ? (
            <>
              <Lock className="w-3.5 h-3.5 mr-1" />
              不足
            </>
          ) : (
            "兑换"
          )}
        </Button>
      </div>
    </Card>
  );
}
