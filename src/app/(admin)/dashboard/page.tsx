"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Users, ClipboardList } from "lucide-react";

interface PendingStats {
  pendingTasks: number;
  pendingOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PendingStats>({
    pendingTasks: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats/pending");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "任务审核",
      description: "审核用户提交的任务",
      href: "/task-review",
      icon: ClipboardList,
      count: stats.pendingTasks,
      countLabel: "待审核",
    },
    {
      title: "订单审核",
      description: "审核用户的兑换申请",
      href: "/order-review",
      icon: Package,
      count: stats.pendingOrders,
      countLabel: "待审核",
    },
    {
      title: "发货管理",
      description: "管理已批准的订单发货",
      href: "/shipping",
      icon: CheckCircle2,
    },
    {
      title: "用户管理",
      description: "管理系统用户",
      href: "/users",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">控制台</h1>
        <p className="text-white/50 text-sm">管理员仪表板</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const hasPending = action.count !== undefined && action.count > 0;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="apple-card apple-card-hover cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-5 w-5 text-white/60" />
                    {hasPending && (
                      <Badge className="bg-amber-500/80 text-white text-xs">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-white mb-1">{action.title}</h3>
                  <p className="text-xs text-white/40">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/products">
          <Card className="apple-card apple-card-hover cursor-pointer">
            <CardContent className="p-6">
              <h3 className="font-medium text-white mb-1">商品管理</h3>
              <p className="text-sm text-white/40">添加、编辑、删除商品</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
