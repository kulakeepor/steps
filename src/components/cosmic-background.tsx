"use client";

/**
 * 宇宙背景 - 纯黑+巨大月亮
 * 参考风格：孤独、静谧、银河系漫游
 */
export function CosmicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 纯黑背景 - 无渐变，无星星 */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* 巨大的月亮 - 占画面约60%，居中偏左 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] min-w-[300px] min-h-[300px]">
        {/* 月球本体 */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#e8e8e8] via-[#c0c0c0] to-[#909090] moon-surface">
          {/* 大型陨石坑 - 月海区域 */}
          <div className="absolute top-[15%] left-[20%] w-[25%] h-[25%] rounded-full bg-gradient-to-br from-[rgba(100,100,100,0.5)] to-[rgba(80,80,80,0.3)] shadow-inner" />
          <div className="absolute top-[50%] left-[55%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-[rgba(90,90,90,0.45)] to-[rgba(70,70,70,0.25)] shadow-inner" />
          <div className="absolute bottom-[20%] left-[35%] w-[20%] h-[20%] rounded-full bg-gradient-to-br from-[rgba(85,85,85,0.4)] to-[rgba(65,65,65,0.2)] shadow-inner" />

          {/* 中型陨石坑 */}
          <div className="absolute top-[35%] left-[15%] w-[12%] h-[12%] rounded-full bg-gradient-to-br from-[rgba(110,110,110,0.35)] to-[rgba(90,90,90,0.2)] shadow-inner" />
          <div className="absolute top-[25%] left-[60%] w-[10%] h-[10%] rounded-full bg-gradient-to-br from-[rgba(105,105,105,0.3)] to-[rgba(85,85,85,0.18)] shadow-inner" />
          <div className="absolute bottom-[35%] right-[20%] w-[14%] h-[14%] rounded-full bg-gradient-to-br from-[rgba(100,100,100,0.38)] to-[rgba(80,80,80,0.22)] shadow-inner" />
          <div className="absolute bottom-[15%] right-[40%] w-[8%] h-[8%] rounded-full bg-gradient-to-br from-[rgba(108,108,108,0.32)] to-[rgba(88,88,88,0.18)] shadow-inner" />

          {/* 小型陨石坑 - 密集分布 */}
          <div className="absolute top-[45%] left-[40%] w-[5%] h-[5%] rounded-full bg-[rgba(95,95,95,0.3)] shadow-inner" />
          <div className="absolute top-[60%] left-[25%] w-[4%] h-[4%] rounded-full bg-[rgba(92,92,92,0.28)] shadow-inner" />
          <div className="absolute top-[20%] left-[45%] w-[6%] h-[6%] rounded-full bg-[rgba(98,98,98,0.25)] shadow-inner" />
          <div className="absolute top-[70%] left-[50%] w-[5%] h-[5%] rounded-full bg-[rgba(90,90,90,0.3)] shadow-inner" />
          <div className="absolute top-[40%] right-[30%] w-[4%] h-[4%] rounded-full bg-[rgba(93,93,93,0.26)] shadow-inner" />
          <div className="absolute bottom-[40%] left-[15%] w-[6%] h-[6%] rounded-full bg-[rgba(96,96,96,0.28)] shadow-inner" />
          <div className="absolute top-[15%] right-[35%] w-[5%] h-[5%] rounded-full bg-[rgba(94,94,94,0.24)] shadow-inner" />
          <div className="absolute bottom-[25%] left-[55%] w-[4%] h-[4%] rounded-full bg-[rgba(91,91,91,0.27)] shadow-inner" />

          {/* 微小陨石坑 - 表面纹理 */}
          <div className="absolute top-[30%] left-[32%] w-[2.5%] h-[2.5%] rounded-full bg-[rgba(90,90,90,0.2)]" />
          <div className="absolute top-[55%] left-[48%] w-[2%] h-[2%] rounded-full bg-[rgba(88,88,88,0.22)]" />
          <div className="absolute top-[65%] left-[38%] w-[3%] h-[3%] rounded-full bg-[rgba(92,92,92,0.18)]" />
          <div className="absolute top-[48%] left-[62%] w-[2%] h-[2%] rounded-full bg-[rgba(86,86,86,0.2)]" />
          <div className="absolute bottom-[50%] right-[32%] w-[2.5%] h-[2.5%] rounded-full bg-[rgba(94,94,94,0.19)]" />
          <div className="absolute top-[75%] left-[22%] w-[2%] h-[2%] rounded-full bg-[rgba(89,89,89,0.21)]" />
          <div className="absolute bottom-[60%] right-[25%] w-[3%] h-[3%] rounded-full bg-[rgba(91,91,91,0.17)]" />
          <div className="absolute top-[22%] left-[28%] w-[2%] h-[2%] rounded-full bg-[rgba(93,93,93,0.2)]" />

          {/* 阴影效果 - 增强立体感 */}
          <div className="absolute inset-0 rounded-full shadow-inner-2" />
        </div>
      </div>

      {/* 微弱的光晕 - 仅在月亮周围 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-white/3 blur-3xl" />
    </div>
  );
}
