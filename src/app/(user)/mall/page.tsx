"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Coins } from "lucide-react";
import Image from "next/image";
import { GamifiedPointsBadge } from "@/components/gamified-points-badge";

interface Product {
  id: string;
  name: string;
  image: string;
  stepsPrice: number;
  stock: number;
}

export default function MallPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [userSteps, setUserSteps] = useState(0);
  const [previousSteps, setPreviousSteps] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?sort=${sort}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedProduct) return;

    setRedeeming(true);
    setPreviousSteps(userSteps);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id }),
      });

      if (response.ok) {
        toast({
          title: "🎉 兑换成功",
          description: `已消耗 ${selectedProduct.stepsPrice} 积分`,
        });
        setSelectedProduct(null);
        fetchUserSteps();
        fetchProducts();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "兑换失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "兑换失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setRedeeming(false);
    }
  };

  const fetchUserSteps = async () => {
    try {
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const data = await response.json();
        setPreviousSteps(userSteps);
        setUserSteps(data.steps);
      }
    } catch (error) {
      console.error("Error fetching user steps:", error);
    }
  };

  useEffect(() => {
    fetchUserSteps();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header - 苹果风格 */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">积分商城</h1>
          <p className="text-white/50 text-sm">兑换心仪商品</p>
        </div>
        <GamifiedPointsBadge
          points={userSteps}
          previousPoints={previousSteps}
          size="md"
          showLabel
          onClick={() => router.push("/orders")}
        />
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <span className="text-sm text-white/40">{products.length} 件商品</span>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[120px] h-9 bg-white/5 border-white/10 text-white/70">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            <SelectItem value="default" className="text-white/70">默认</SelectItem>
            <SelectItem value="price-asc" className="text-white/70">积分 ↑</SelectItem>
            <SelectItem value="price-desc" className="text-white/70">积分 ↓</SelectItem>
            <SelectItem value="stock" className="text-white/70">库存</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-white/40">暂无商品，敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const canAfford = userSteps >= product.stepsPrice;
            const isOutOfStock = product.stock === 0;
            const isDisabled = isOutOfStock || !canAfford;

            return (
              <Card
                key={product.id}
                className={`apple-card apple-card-hover overflow-hidden ${
                  isDisabled ? "opacity-40" : ""
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-white/5">
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
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.stock > 10
                            ? "bg-emerald-500/80 text-white"
                            : "bg-amber-500/80 text-white"
                        } backdrop-blur-sm`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  )}

                  {/* Sold out overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-3 py-1 bg-black/60 rounded-full backdrop-blur-sm">
                        已售罄
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-medium text-sm text-white line-clamp-2 min-h-[2.25rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm font-semibold text-white">
                      <Coins className="w-3.5 h-3.5" />
                      {product.stepsPrice}
                    </div>

                    {!canAfford && !isOutOfStock && (
                      <span className="text-xs text-white/40">
                        还需 {product.stepsPrice - userSteps}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => setSelectedProduct(product)}
                    disabled={isDisabled}
                    size="sm"
                    className="w-full bg-white text-black hover:bg-white/90 font-medium"
                  >
                    {isOutOfStock ? "已售罄" : !canAfford ? "积分不足" : "兑换"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Redeem Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="apple-card">
          <DialogHeader>
            <DialogTitle className="text-white">确认兑换</DialogTitle>
            <DialogDescription className="text-white/50">
              兑换后积分将立即扣除，订单需要管理员审核
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{selectedProduct.name}</h3>
                  <p className="text-sm text-white/40">库存: {selectedProduct.stock}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                <span className="text-sm text-white/50">消耗积分</span>
                <span className="text-lg font-semibold text-white">
                  -{selectedProduct.stepsPrice}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">兑换后剩余</span>
                <span className="font-medium text-white">
                  {userSteps - selectedProduct.stepsPrice} 积分
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedProduct(null)}
              disabled={redeeming}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              取消
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeeming}
              className="bg-white text-black hover:bg-white/90 font-medium"
            >
              {redeeming ? "兑换中..." : "确认兑换"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
