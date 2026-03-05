"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Package, CheckCircle2, XCircle, Clock, Truck, ClipboardCheck } from "lucide-react";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  image: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  stepsCost: number;
  submittedAt: string;
  reviewedAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  product: Product;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
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

  const handleConfirmReceipt = async (orderId: string) => {
    setConfirming(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: response.ok ? "操作成功" : "操作失败",
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
      setConfirming(null);
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { label: "待审核", icon: Clock, className: "bg-amber-100 text-amber-700" };
      case OrderStatus.APPROVED:
        return { label: "已通过", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" };
      case OrderStatus.SHIPPED:
        return { label: "已发货", icon: Truck, className: "bg-blue-100 text-blue-700" };
      case OrderStatus.COMPLETED:
        return { label: "已完成", icon: ClipboardCheck, className: "bg-emerald-100 text-emerald-700" };
      case OrderStatus.REJECTED:
        return { label: "已拒绝", icon: XCircle, className: "bg-red-100 text-red-700" };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-display font-semibold mb-2">我的兑换</h1>
        <p className="text-muted-foreground">查看您的兑换记录</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无兑换记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={order.id}
                className="hover:border-violet-200 transition-all duration-200"
              >
                <CardContent className="p-8">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={order.product.image}
                        alt={order.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold">{order.product.name}</h3>
                        <Badge className={statusInfo.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{order.stepsCost} 积分</span>
                        <span>·</span>
                        <span>{formatDate(order.submittedAt)}</span>
                      </div>

                      {/* Confirm Receipt Button */}
                      {order.status === OrderStatus.SHIPPED && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmReceipt(order.id)}
                            disabled={confirming === order.id}
                          >
                            {confirming === order.id ? "处理中..." : "确认收货"}
                          </Button>
                        </div>
                      )}
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
