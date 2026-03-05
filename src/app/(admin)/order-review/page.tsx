"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Coins } from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
}

interface Order {
  id: string;
  stepsCost: number;
  submittedAt: string;
  user: User;
  product: Product;
}

export default function OrderReviewPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pending-orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (orderId: string, approved: boolean) => {
    setProcessing(orderId);
    try {
      const response = await fetch("/api/orders/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, approved }),
      });

      if (response.ok) {
        toast({
          title: approved ? "已通过" : "已拒绝",
          description: approved ? "订单已通过，等待发货" : "订单已拒绝，积分已退回",
        });
        await fetchOrders();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "操作失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchReview = async (approved: boolean) => {
    if (selectedIds.size === 0) {
      toast({
        variant: "destructive",
        title: "未选择订单",
        description: "请先选择要审核的订单",
      });
      return;
    }

    setBatchProcessing(true);
    try {
      const response = await fetch("/api/orders/batch-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selectedIds),
          approved,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: approved ? "批量通过" : "批量拒绝",
          description: `已处理 ${data.count} 个订单`,
        });
        await fetchOrders();
        setSelectedIds(new Set());
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "操作失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-6 py-10 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">订单审核</span>
          </h1>
          <p className="text-muted-foreground">审核用户的兑换申请</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {orders.length} 个待审核
          </span>
          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchReview(false)}
                disabled={batchProcessing}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                批量拒绝 ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                onClick={() => handleBatchReview(true)}
                disabled={batchProcessing}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                批量通过 ({selectedIds.size})
              </Button>
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无待审核订单</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                checked={selectedIds.size === orders.length}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                全选 ({orders.length} 条)
              </label>
            </div>
          )}

          {orders.map((order) => {
            const isSelected = selectedIds.has(order.id);
            return (
              <Card
                key={order.id}
                className={isSelected ? "ring-2 ring-primary" : ""}
              >
                <CardContent className="p-8">
                  <div className="flex gap-6">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(order.id)}
                      className="mt-6"
                    />
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={order.product.image}
                        alt={order.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {order.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.user.name} ({order.user.email})
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Coins className="h-4 w-4" />
                          {order.stepsCost}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          提交时间: {formatDate(order.submittedAt)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(order.id, false)}
                            disabled={processing === order.id || batchProcessing}
                            className="gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            拒绝
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReview(order.id, true)}
                            disabled={processing === order.id || batchProcessing}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            通过
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
