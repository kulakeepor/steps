"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coins, Plus, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import { GamifiedPointsBadge } from "@/components/gamified-points-badge";
import { formatDate } from "@/lib/utils";

type WishStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Wish {
  id: string;
  itemName: string;
  stepsCost: number;
  status: WishStatus;
  submittedAt: string;
  reviewedAt: string | null;
}

const statusConfig = {
  PENDING: {
    label: "待审核",
    icon: Clock,
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  APPROVED: {
    label: "已通过",
    icon: CheckCircle2,
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  REJECTED: {
    label: "未通过",
    icon: XCircle,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

export default function WishPoolPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [itemName, setItemName] = useState("");
  const [stepsCost, setStepsCost] = useState("");
  const [userSteps, setUserSteps] = useState(0);
  const [previousSteps, setPreviousSteps] = useState(0);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wishes");
      if (response.ok) {
        const data = await response.json();
        setWishes(data);
      }
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWish = async () => {
    if (!itemName.trim() || !stepsCost) {
      toast({
        variant: "destructive",
        title: "填写不完整",
        description: "请填写物品名称和愿意支付的积分",
      });
      return;
    }

    const cost = parseInt(stepsCost);
    if (isNaN(cost) || cost <= 0) {
      toast({
        variant: "destructive",
        title: "积分无效",
        description: "请输入有效的积分数量",
      });
      return;
    }

    if (cost > userSteps) {
      toast({
        variant: "destructive",
        title: "积分不足",
        description: "您的积分不足以支付此许愿",
      });
      return;
    }

    setCreating(true);
    setPreviousSteps(userSteps);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, stepsCost: cost }),
      });

      if (response.ok) {
        toast({
          title: "🌟 许愿成功",
          description: `已消耗 ${cost} 积分，等待管理员审核`,
        });
        setCreateDialogOpen(false);
        setItemName("");
        setStepsCost("");
        fetchUserSteps();
        fetchWishes();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "许愿失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "许愿失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setCreating(false);
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
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">
            <span className="flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-purple-400" />
              许愿池
            </span>
          </h1>
          <p className="text-white/50 text-sm">许下心愿，等待实现</p>
        </div>
        <div className="flex items-center gap-3">
          <GamifiedPointsBadge
            points={userSteps}
            previousPoints={previousSteps}
            size="md"
            showLabel
          />
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            创建许愿
          </Button>
        </div>
      </div>

      {/* Wishes List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : wishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-white/40 mb-1">还没有许愿记录</p>
          <p className="text-white/30 text-sm">点击上方"创建许愿"开始许愿吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wishes.map((wish) => {
            const config = statusConfig[wish.status];
            const StatusIcon = config.icon;

            return (
              <Card
                key={wish.id}
                className="apple-card overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-white text-lg">
                          {wish.itemName}
                        </h3>
                        <Badge className={config.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-white/70">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{wish.stepsCost}</span>
                          <span className="text-white/50">积分</span>
                        </div>
                        <span className="text-white/40">
                          提交于 {formatDate(wish.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {wish.status === "REJECTED" && wish.reviewedAt && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-white/50">
                        审核时间: {formatDate(wish.reviewedAt)}
                      </p>
                      <p className="text-sm text-red-400 mt-1">
                        积分已退回至您的账户
                      </p>
                    </div>
                  )}

                  {wish.status === "APPROVED" && wish.reviewedAt && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-white/50">
                        审核时间: {formatDate(wish.reviewedAt)}
                      </p>
                      <p className="text-sm text-emerald-400 mt-1">
                        许愿已通过，请等待后续安排
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Wish Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="apple-card">
          <DialogHeader>
            <DialogTitle className="text-white">创建许愿</DialogTitle>
            <DialogDescription className="text-white/50">
              填写您想要的物品名称和愿意支付的积分，许愿后积分将被扣除
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-white/70">
                物品名称
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="例如：无线鼠标、机械键盘..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepsCost" className="text-white/70">
                愿意支付的积分
              </Label>
              <Input
                id="stepsCost"
                type="number"
                value={stepsCost}
                onChange={(e) => setStepsCost(e.target.value)}
                placeholder="输入积分数量"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                disabled={creating}
                min={1}
                max={userSteps}
              />
              <p className="text-xs text-white/40">
                当前余额: {userSteps} 积分
              </p>
            </div>

            {stepsCost && (
              <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                <span className="text-sm text-white/50">许愿后剩余</span>
                <span className="text-lg font-semibold text-white">
                  {Math.max(0, userSteps - parseInt(stepsCost || "0"))} 积分
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              取消
            </Button>
            <Button
              onClick={handleCreateWish}
              disabled={creating}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium"
            >
              {creating ? "创建中..." : "确认许愿"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
