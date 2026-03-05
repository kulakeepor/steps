"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Truck, Package, Coins } from "lucide-react";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  image: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  submittedAt: string;
  reviewedAt: string | null;
  shippedAt: string | null;
  product: Product;
  user: User;
}

export default function ShippingPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get approved and shipped orders
      const [approvedRes, shippedRes] = await Promise.all([
        fetch("/api/orders?status=APPROVED"),
        fetch("/api/orders?status=SHIPPED"),
      ]);

      if (approvedRes.ok && shippedRes.ok) {
        const approved = await approvedRes.json();
        const shipped = await shippedRes.json();
        setOrders([...approved, ...shipped]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.status === OrderStatus.SHIPPED ? "已发货" : "已取消发货",
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  // Group orders by status
  const approvedOrders = orders.filter((o) => o.status === OrderStatus.APPROVED);
  const shippedOrders = orders.filter((o) => o.status === OrderStatus.SHIPPED);

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-6 py-10 md:py-12">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">发货管理</span>
        </h1>
        <p className="text-muted-foreground">管理已批准的订单发货</p>
      </div>

      {/* Approved Orders */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">待发货</h2>
          <Badge variant="secondary">{approvedOrders.length}</Badge>
        </div>

        {approvedOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无待发货订单</p>
            </CardContent>
          </Card>
        ) : (
          approvedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-8">
                <div className="flex gap-6">
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
                      <Button
                        onClick={() => handleShip(order.id)}
                        disabled={processing === order.id}
                        className="gap-1"
                      >
                        <Truck className="h-4 w-4" />
                        {processing === order.id ? "处理中..." : "标记发货"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      审核时间: {order.reviewedAt ? formatDate(order.reviewedAt) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Shipped Orders */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">已发货</h2>
          <Badge variant="secondary">{shippedOrders.length}</Badge>
        </div>

        {shippedOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无已发货订单</p>
            </CardContent>
          </Card>
        ) : (
          shippedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-8">
                <div className="flex gap-6">
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
                      <Button
                        variant="outline"
                        onClick={() => handleShip(order.id)}
                        disabled={processing === order.id}
                      >
                        {processing === order.id ? "处理中..." : "取消发货"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      发货时间: {order.shippedAt ? formatDate(order.shippedAt) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
