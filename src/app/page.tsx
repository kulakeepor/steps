import Link from "next/link";
import { Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 cosmic-content">
      {/* Hero Section - 苹果风格 */}
      <div className="text-center mb-16 max-w-2xl animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 mb-8"
        >
          <Package className="w-10 h-10 text-white" />
        </Link>
        <h1 className="apple-title text-high-contrast mb-4">
          STEPs
        </h1>
        <p className="apple-body text-medium-contrast max-w-md mx-auto">
          用每一次进步，兑换你想要的奖励
        </p>
      </div>

      {/* Feature Cards - 苹果风格 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <Link href="/mall" className="group">
          <div className="apple-card apple-card-hover p-8 text-center h-full">
            <Package className="w-8 h-8 text-white/80 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">积分商城</h3>
            <p className="text-sm text-white/50">使用积分兑换心仪商品</p>
          </div>
        </Link>
        <Link href="/tasks" className="group">
          <div className="apple-card apple-card-hover p-8 text-center h-full">
            <div className="w-8 h-8 mx-auto mb-4 text-white/80">✓</div>
            <h3 className="text-lg font-semibold text-white mb-2">任务中心</h3>
            <p className="text-sm text-white/50">完成任务赚取积分</p>
          </div>
        </Link>
        <Link href="/orders" className="group">
          <div className="apple-card apple-card-hover p-8 text-center h-full">
            <div className="w-8 h-8 mx-auto mb-4 text-white/80">📦</div>
            <h3 className="text-lg font-semibold text-white mb-2">我的兑换</h3>
            <p className="text-sm text-white/50">查看兑换记录和状态</p>
          </div>
        </Link>
      </div>

      {/* Bottom Info */}
      <p className="mt-20 text-sm text-white/30">
        每日签到 · 完成任务 · 赚取积分 · 兑换奖励
      </p>
    </div>
  );
}
