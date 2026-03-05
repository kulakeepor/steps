"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, XCircle, Coins } from "lucide-react";

interface Task {
  id: string;
  name: string;
  description: string;
  stepsReward: number;
  sortOrder: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
}

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (taskId: string) => {
    setSubmitting(taskId);
    try {
      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "提交成功",
          description: "谢谢你的努力，管理员审核后将会发放 STEPs",
        });
        await fetchTasks();
      } else {
        toast({
          variant: "destructive",
          title: "提交失败",
          description: data.error || "未知错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "提交失败",
        description: "网络错误，请稍后重试",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3" />
            待审核
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            已通过
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1 bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3" />
            已拒绝
          </Badge>
        );
      default:
        return null;
    }
  };

  const canSubmit = (status: Task["status"]) => {
    return status === null || status === "REJECTED" || status === "APPROVED";
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">任务中心</h1>
        <p className="text-white/50 text-sm">完成任务赚取积分</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="apple-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-white/40">暂无任务</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="apple-card apple-card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-white">{task.name}</h3>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-sm text-white/50 mb-4">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                        <Coins className="w-4 h-4" />
                        +{task.stepsReward} STEPs
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSubmit(task.id)}
                    disabled={!canSubmit(task.status) || submitting === task.id}
                    className="bg-white text-black hover:bg-white/90 font-medium shrink-0"
                  >
                    {submitting === task.id ? "提交中..." : "提交任务"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
