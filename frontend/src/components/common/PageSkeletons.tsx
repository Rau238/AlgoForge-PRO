"use client";

import React from "react";

// Base Shimmer block that seamlessly matches AlgoForge sleek dark theme (#080c14)
export const SkeletonBox: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "", style }) => (
  <div
    style={style}
    className={`bg-[#121c2f] relative overflow-hidden rounded ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
  </div>
);

// 1. DASHBOARD SKELETON
export const DashboardSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    {/* Top 4 Metric KPI Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#0c1220] border border-[#18263f] p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-3 w-20" />
            <SkeletonBox className="h-4 w-4 rounded-md" />
          </div>
          <SkeletonBox className="h-6 w-28" />
          <div className="flex items-center justify-between pt-1">
            <SkeletonBox className="h-2.5 w-16" />
            <SkeletonBox className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>

    {/* Main Chart + Quick Trade Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#18263f] pb-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-4 w-14" />
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((k) => (
              <SkeletonBox key={k} className="h-6 w-10 rounded-md" />
            ))}
          </div>
        </div>
        <SkeletonBox className="h-72 w-full rounded-lg" />
      </div>

      {/* Right: Quick Trade / Orderbook */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3">
        <SkeletonBox className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-2">
          <SkeletonBox className="h-8 w-full rounded-lg" />
          <SkeletonBox className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-2 pt-2">
          <SkeletonBox className="h-7 w-full" />
          <SkeletonBox className="h-7 w-full" />
          <SkeletonBox className="h-7 w-full" />
        </div>
        <SkeletonBox className="h-10 w-full rounded-lg mt-4" />
      </div>
    </div>

    {/* Bottom: Open Positions Table */}
    <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-4 w-36" />
        <SkeletonBox className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((r) => (
          <div key={r} className="p-2.5 rounded-lg bg-[#080c14] border border-[#18263f] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SkeletonBox className="h-5 w-5 rounded-full" />
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-3.5 w-12 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <SkeletonBox className="h-4 w-16" />
              <SkeletonBox className="h-4 w-14" />
              <SkeletonBox className="h-6 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 2. MARKETS SKELETON (Content-proportioned for Screener & Delta Exchange List)
export const MarketsSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    {/* Header & Controls */}
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0c1220] border border-[#18263f] p-3 rounded-xl">
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-4 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-7 w-48 rounded-lg" />
        <SkeletonBox className="h-7 w-24 rounded-lg" />
      </div>
    </div>

    {/* Top Market Summary Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[1, 2, 3].map((c) => (
        <div key={c} className="bg-[#0c1220] border border-[#18263f] p-3 rounded-xl space-y-1.5">
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-6 w-36" />
          <SkeletonBox className="h-2.5 w-20" />
        </div>
      ))}
    </div>

    {/* Filter Pills */}
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {[1, 2, 3, 4, 5, 6].map((p) => (
        <SkeletonBox key={p} className="h-7 w-24 rounded-lg shrink-0" />
      ))}
    </div>

    {/* Markets Table Rows */}
    <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
      <div className="p-3 border-b border-[#18263f] bg-[#0d1424] flex items-center justify-between text-xs">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-16" />
      </div>
      <div className="divide-y divide-[#141f33]">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div key={row} className="p-3 flex items-center justify-between bg-[#0c1220]">
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-6 w-6 rounded-full shrink-0" />
              <div className="space-y-1">
                <SkeletonBox className="h-3.5 w-20" />
                <SkeletonBox className="h-2.5 w-14" />
              </div>
            </div>
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-5 w-14 rounded" />
            <SkeletonBox className="h-4 w-24 hidden md:block" />
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-6 w-14 rounded-md" />
              <SkeletonBox className="h-6 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 3. POSITIONS SKELETON
export const PositionsSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    {/* KPI Banner */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-6 w-24" />
        </div>
      ))}
    </div>

    {/* Filter & Action Bar */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-7 w-20 rounded-lg" />
        <SkeletonBox className="h-7 w-24 rounded-lg" />
      </div>
      <SkeletonBox className="h-7 w-28 rounded-lg" />
    </div>

    {/* Position Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((pos) => (
        <div key={pos} className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-5 w-20" />
              <SkeletonBox className="h-4 w-12 rounded" />
            </div>
            <SkeletonBox className="h-5 w-20 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <SkeletonBox className="h-2.5 w-12" />
              <SkeletonBox className="h-4 w-16" />
            </div>
            <div className="space-y-1">
              <SkeletonBox className="h-2.5 w-12" />
              <SkeletonBox className="h-4 w-16" />
            </div>
            <div className="space-y-1">
              <SkeletonBox className="h-2.5 w-12" />
              <SkeletonBox className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <SkeletonBox className="h-3 w-32" />
            <SkeletonBox className="h-6 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 4. ORDERS SKELETON
export const OrdersSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="flex items-center justify-between bg-[#0c1220] border border-[#18263f] p-3 rounded-xl">
      <SkeletonBox className="h-5 w-28" />
      <SkeletonBox className="h-7 w-24 rounded-lg" />
    </div>
    <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden divide-y divide-[#141f33]">
      {[1, 2, 3, 4, 5, 6].map((o) => (
        <div key={o} className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-5 w-12 rounded" />
            <div className="space-y-1">
              <SkeletonBox className="h-3.5 w-20" />
              <SkeletonBox className="h-2.5 w-16" />
            </div>
          </div>
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// 5. TRADE HISTORY SKELETON
export const TradeHistorySkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-6 w-28" />
        </div>
      ))}
    </div>
    <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden divide-y divide-[#141f33]">
      {[1, 2, 3, 4, 5].map((t) => (
        <div key={t} className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SkeletonBox className="h-5 w-14 rounded" />
            <div className="space-y-1">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-2.5 w-32" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 6. CRYPTO INTELLIGENCE SKELETON
export const CryptoIntelligenceSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    {/* 4 Top Indicator Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#0c1220] border border-[#18263f] p-3 rounded-xl space-y-1.5">
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-6 w-32" />
          <SkeletonBox className="h-2.5 w-20" />
        </div>
      ))}
    </div>

    {/* Tab Switcher Skeleton */}
    <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-7 w-32 rounded-lg" />
        <SkeletonBox className="h-7 w-36 rounded-lg" />
        <SkeletonBox className="h-7 w-32 rounded-lg" />
      </div>
      <SkeletonBox className="h-7 w-40 rounded-lg" />
    </div>

    {/* Dual Liquidation Map or Strategies Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-16 rounded" />
          </div>
          <SkeletonBox className="h-14 w-full rounded-lg" />
          <div className="flex items-center justify-between pt-1">
            <SkeletonBox className="h-3.5 w-24" />
            <SkeletonBox className="h-6 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 7. CHART SKELETON
export const ChartSkeleton: React.FC = () => (
  <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden select-none bg-[#080c14] font-sans animate-in fade-in duration-200">
    {/* Ticker tape bar */}
    <div className="h-8 bg-[#0b101c] border-b border-[#1e2b45] px-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-4 w-28" />
        {[1, 2, 3, 4, 5].map((k) => (
          <SkeletonBox key={k} className="h-5 w-16 rounded" />
        ))}
      </div>
      <SkeletonBox className="h-4 w-20" />
    </div>

    {/* Chart Body */}
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-6 w-32" />
            <SkeletonBox className="h-5 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((t) => (
              <SkeletonBox key={t} className="h-6 w-9 rounded" />
            ))}
          </div>
        </div>
        <SkeletonBox className="flex-1 w-full rounded-lg" />
      </div>

      {/* Right Drawer Planner Placeholder */}
      <div className="w-80 border-l border-[#1e2b45] p-3 space-y-3 hidden lg:flex flex-col bg-[#0b101c]">
        <SkeletonBox className="h-5 w-28" />
        <SkeletonBox className="h-8 w-full rounded-lg" />
        <SkeletonBox className="h-12 w-full rounded-lg" />
        <SkeletonBox className="h-12 w-full rounded-lg" />
        <SkeletonBox className="h-10 w-full rounded-lg mt-auto" />
      </div>
    </div>
  </div>
);

// 8. ANALYTICS SKELETON
export const AnalyticsSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-1.5">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-6 w-28" />
        </div>
      ))}
    </div>
    <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-4 space-y-3">
      <SkeletonBox className="h-4 w-36" />
      <SkeletonBox className="h-64 w-full rounded-lg" />
    </div>
  </div>
);

// 9. BACKTESTING SKELETON
export const BacktestingSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-3">
      <SkeletonBox className="h-5 w-40" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <SkeletonBox className="h-8 w-full rounded-lg" />
        <SkeletonBox className="h-8 w-full rounded-lg" />
        <SkeletonBox className="h-8 w-full rounded-lg" />
      </div>
    </div>
    <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-3">
      <SkeletonBox className="h-4 w-32" />
      <SkeletonBox className="h-72 w-full rounded-lg" />
    </div>
  </div>
);

// 10. PORTFOLIO SKELETON
export const PortfolioSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2 bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-3">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-48 w-full rounded-lg" />
      </div>
      <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-3">
        <SkeletonBox className="h-4 w-28" />
        <SkeletonBox className="h-48 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// 11. STRATEGIES SKELETON
export const StrategiesSkeleton: React.FC = () => (
  <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-200">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <SkeletonBox className="h-5 w-40" />
        <SkeletonBox className="h-3 w-56" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-8 w-28 rounded-lg" />
        <SkeletonBox className="h-8 w-36 rounded-lg" />
      </div>
    </div>
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {[1, 2, 3, 4].map((t) => (
        <SkeletonBox key={t} className="h-7 w-32 rounded-lg shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-4 w-36" />
            <SkeletonBox className="h-4 w-14 rounded" />
          </div>
          <SkeletonBox className="h-10 w-full rounded" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#18263f]">
            <SkeletonBox className="h-6 w-full" />
            <SkeletonBox className="h-6 w-full" />
            <SkeletonBox className="h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

