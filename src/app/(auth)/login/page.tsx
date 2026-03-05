"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Footprints } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result.error,
        });
      } else {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "发生未知错误，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 cosmic-content">
      <Card className="w-full max-w-md apple-card">
        <CardContent className="pt-8 pb-6 px-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <Footprints className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-1">STEPs</h1>
            <p className="text-sm text-white/50">积分兑换系统</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/70">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/70">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                minLength={6}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          {/* Test Accounts */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm font-medium text-white/50 mb-3 text-center">测试账号</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
                <span className="text-white/50">管理员</span>
                <span className="font-mono text-white/70">admin@example.com / admin123</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
                <span className="text-white/50">普通用户</span>
                <span className="font-mono text-white/70">user@example.com / user123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
