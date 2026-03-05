"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Coins } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  stepsReward: number;
}

interface Submission {
  id: string;
  submittedAt: string;
  user: User;
  task: Task;
}

export default function TaskReviewPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/task-submissions");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: string, approved: boolean) => {
    setProcessing(submissionId);
    try {
      const response = await fetch("/api/tasks/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, approved }),
      });

      if (response.ok) {
        toast({
          title: approved ? "已通过" : "已拒绝",
          description: approved ? "任务已通过，积分已发放" : "任务已拒绝",
        });
        await fetchSubmissions();
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
      setProcessing(null);
    }
  };

  const handleBatchReview = async (approved: boolean) => {
    if (selectedIds.size === 0) {
      toast({
        variant: "destructive",
        title: "未选择任务",
        description: "请先选择要审核的任务",
      });
      return;
    }

    setBatchProcessing(true);
    try {
      const response = await fetch("/api/tasks/batch-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionIds: Array.from(selectedIds),
          approved,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: approved ? "批量通过" : "批量拒绝",
          description: `已处理 ${data.count} 个任务`,
        });
        await fetchSubmissions();
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
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map((s) => s.id)));
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
            <span className="gradient-text">任务审核</span>
          </h1>
          <p className="text-muted-foreground">审核用户提交的任务</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {submissions.length} 个待审核
          </Badge>
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

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无待审核任务</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {submissions.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                checked={selectedIds.size === submissions.length}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                全选 ({submissions.length} 条)
              </label>
            </div>
          )}

          {submissions.map((submission) => {
            const isSelected = selectedIds.has(submission.id);
            return (
              <Card
                key={submission.id}
                className={isSelected ? "ring-2 ring-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(submission.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{submission.task.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {submission.user.name} ({submission.user.email})
                          </p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Coins className="h-3 w-3" />
                          +{submission.task.stepsReward}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {submission.task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      提交时间: {formatDate(submission.submittedAt)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(submission.id, false)}
                        disabled={processing === submission.id || batchProcessing}
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        拒绝
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(submission.id, true)}
                        disabled={processing === submission.id || batchProcessing}
                        className="gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        通过
                      </Button>
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
