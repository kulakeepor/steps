"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Settings, LayoutDashboard, Package, Footprints, Sparkles } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { GamifiedPointsBadge } from "@/components/gamified-points-badge";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container-apple flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all group-hover:bg-white/15">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">STEPs</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    控制台
                  </Button>
                </Link>
                <Link href="/task-review">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    任务审核
                  </Button>
                </Link>
                <Link href="/order-review">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    订单审核
                  </Button>
                </Link>
                <Link href="/wish-review">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                    许愿审核
                  </Button>
                </Link>
                <Link href="/shipping">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    发货管理
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Package className="mr-2 h-4 w-4" />
                    商品管理
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <User className="mr-2 h-4 w-4" />
                    用户管理
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/mall">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Package className="mr-2 h-4 w-4" />
                    商城
                  </Button>
                </Link>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    任务中心
                  </Button>
                </Link>
                <Link href="/wish-pool">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                    许愿池
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    我的兑换
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && !isAdmin && (
            <div onClick={() => router.push("/orders")} className="cursor-pointer">
              <GamifiedPointsBadge points={session.user.steps} size="sm" />
            </div>
          )}

          {session?.user && !isAdmin && <NotificationBell />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/10 text-white text-sm font-medium">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10" align="end" forceMount>
              <DropdownMenuLabel className="font-normal text-white">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-white/50">
                    {session?.user?.email}
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-white/70 mt-1 font-medium">
                      {session?.user?.steps?.toLocaleString() || "0"} STEPs
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer text-white/70 hover:text-white hover:bg-white/5">
                  <Settings className="mr-2 h-4 w-4" />
                  个人设置
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-400 focus:text-red-400 hover:bg-white/5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
