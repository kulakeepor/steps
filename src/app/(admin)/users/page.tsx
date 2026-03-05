"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Ban, Check, Search, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { UserRole } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  steps: number;
  status: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  pages: number;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [showDialog, setShowDialog] = useState(false);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    name: "",
    email: "",
    password: "",
    role: UserRole.USER,
  });

  const [stepsFormData, setStepsFormData] = useState({
    amount: "",
    reason: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: UserRole.USER });
    setShowDialog(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请填写姓名和邮箱",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "新用户密码不能为空",
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "密码至少需要6个字符",
      });
      return;
    }

    setSaving(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const response = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingUser ? "更新成功" : "创建成功",
        });
        setShowDialog(false);
        await fetchUsers();
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
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setToggling(id);
    try {
      const response = await fetch(`/api/users/${id}/toggle`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "状态已更新",
        });
        await fetchUsers();
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
      setToggling(null);
    }
  };

  const openStepsDialog = (user: User) => {
    setAdjustingUser(user);
    setStepsFormData({ amount: "", reason: "" });
    setShowStepsDialog(true);
  };

  const handleStepsAdjust = async () => {
    if (!adjustingUser) return;

    const amount = parseInt(stepsFormData.amount);
    if (isNaN(amount) || amount === 0) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请输入有效的积分数值",
      });
      return;
    }

    setAdjusting(true);
    try {
      const response = await fetch(`/api/users/${adjustingUser.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          reason: stepsFormData.reason || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "积分调整成功",
          description: `已${amount > 0 ? "增加" : "扣减"} ${Math.abs(amount)} STEPs`,
        });
        setShowStepsDialog(false);
        await fetchUsers();
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
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-6 py-10 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">用户管理</span>
          </h1>
          <p className="text-muted-foreground">管理系统用户</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-1">
          <Plus className="h-4 w-4" />
          添加用户
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="搜索姓名或邮箱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button size="icon" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value={UserRole.USER}>用户</SelectItem>
                <SelectItem value={UserRole.ADMIN}>管理员</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>积分</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  暂无用户
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
                      {user.role === UserRole.ADMIN ? "管理员" : "用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.steps}</TableCell>
                  <TableCell>
                    <Badge variant={user.status ? "default" : "destructive"}>
                      {user.status ? "正常" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openStepsDialog(user)}
                      >
                        <Coins className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={toggling === user.id}
                      >
                        {user.status ? (
                          <Ban className="h-4 w-4 text-destructive" />
                        ) : (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {pages} 页，共 {total} 条
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "编辑用户" : "添加用户"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "修改用户信息" : "创建新用户"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                密码{editingUser && "（留空不修改）"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "留空不修改" : "输入密码"}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>用户</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STEPs Adjustment Dialog */}
      <Dialog open={showStepsDialog} onOpenChange={setShowStepsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整积分</DialogTitle>
            <DialogDescription>
              调整 {adjustingUser?.name} 的 STEPs 余额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm">当前余额</span>
              <span className="text-lg font-bold">{adjustingUser?.steps} STEPs</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">调整数量</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStepsFormData({ ...stepsFormData, amount: "-100" })}
                >
                  -100
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStepsFormData({ ...stepsFormData, amount: "-10" })}
                >
                  -10
                </Button>
                <Input
                  id="amount"
                  type="number"
                  value={stepsFormData.amount}
                  onChange={(e) => setStepsFormData({ ...stepsFormData, amount: e.target.value })}
                  placeholder="输入数量（正数增加，负数扣减）"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStepsFormData({ ...stepsFormData, amount: "10" })}
                >
                  +10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStepsFormData({ ...stepsFormData, amount: "100" })}
                >
                  +100
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                调整后余额: {adjustingUser ? adjustingUser.steps + (parseInt(stepsFormData.amount) || 0) : 0} STEPs
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">原因（可选）</Label>
              <Input
                id="reason"
                value={stepsFormData.reason}
                onChange={(e) => setStepsFormData({ ...stepsFormData, reason: e.target.value })}
                placeholder="例如: 活动奖励、违规扣减"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStepsDialog(false)}
              disabled={adjusting}
            >
              取消
            </Button>
            <Button
              onClick={handleStepsAdjust}
              disabled={adjusting || !stepsFormData.amount}
            >
              {adjusting ? "处理中..." : "确认调整"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
