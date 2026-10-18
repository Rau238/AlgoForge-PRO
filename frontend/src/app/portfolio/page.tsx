"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { PortfolioSkeleton } from "@/components/common/PageSkeletons";
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  Percent,
  Layers,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function PortfolioPage() {
  const { account } = useAlgoForgeStore();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPortfolio();
        setPortfolio(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b"];

  const currentBalance = account.balance || portfolio?.balance || 100.0;
  const currentEquity = account.equity || portfolio?.equity || 103.55;
  const currentUsedMargin = account.usedMargin || portfolio?.used_margin || 25.51;
  const currentFreeMargin = account.freeMargin || portfolio?.free_margin || 78.04;
  const currentUnrealized = account.unrealizedPnl !== undefined ? account.unrealizedPnl : (portfolio?.unrealized_pnl || 3.55);
  const currentRealized = account.realizedPnl !== undefined ? account.realizedPnl : (portfolio?.realized_pnl || 2.40);
  const currentDailyPnl = account.todaysPnl !== undefined ? account.todaysPnl : (portfolio?.daily_pnl || 5.95);

  const statCards = [
    { label: "Account Balance", val: `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-white" },
    { label: "Net Equity", val: `$${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-emerald-400" },
    { label: "Used Margin", val: `$${currentUsedMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-slate-300" },
    { label: "Free Margin", val: `$${currentFreeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-indigo-300" },
    { label: "Unrealized P&L", val: `${currentUnrealized >= 0 ? "+" : ""}$${currentUnrealized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: currentUnrealized >= 0 ? "text-emerald-400" : "text-rose-400" },
    { label: "Realized P&L", val: `${currentRealized >= 0 ? "+" : ""}$${currentRealized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-emerald-400" },
    { label: "Today's P&L", val: `${currentDailyPnl >= 0 ? "+" : ""}$${currentDailyPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: currentDailyPnl >= 0 ? "text-emerald-400" : "text-rose-400" },
    { label: "Total Return", val: `+${portfolio?.total_return_pct || "1.68"}%`, color: "text-emerald-400" },
  ];

  if (loading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            Portfolio & Margin
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Real-time equity valuation, margin reserves & asset allocation
          </p>
        </div>
      </div>

      {/* Top 8 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono-num tabular-nums">
        {statCards.map((s, i) => (
          <div key={i} className="bg-[#0c1220] border border-[#18263f] p-2 sm:p-2.5 rounded-lg">
            <span className="text-[9px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 truncate">{s.label}</span>
            <span className={`text-xs sm:text-sm font-extrabold ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid: Equity Curve & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Equity Curve (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0c1220] border border-[#18263f] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3 border-b border-[#18263f] pb-2">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Cumulative Equity Curve Growth (30 Days)
            </h2>
            <span className="text-xs text-emerald-400 font-bold font-mono-num tabular-nums">
              Margin Level: {portfolio?.margin_level_pct || "2,164"}%
            </span>
          </div>

          <div className="h-44 sm:h-52 w-full font-mono-num tabular-nums">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolio?.equity_curve || []}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.4} />
                <XAxis dataKey="date" stroke="#50617b" fontSize={9.5} tickLine={false} />
                <YAxis stroke="#50617b" fontSize={9.5} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1322",
                    borderColor: "#1e2b45",
                    fontSize: "11px",
                    borderRadius: "6px",
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={2} fill="url(#portGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exposure Diversification (1 Col) */}
        <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#18263f] pb-2 font-sans">
            <Layers className="w-4 h-4 text-indigo-400" />
            Asset Allocation Exposure
          </h2>

          <div className="h-36 sm:h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolio?.allocations || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                >
                  {(portfolio?.allocations || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1322",
                    borderColor: "#1e2b45",
                    fontSize: "11px",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-2 border-t border-[#18263f] text-xs font-mono-num tabular-nums">
            {(portfolio?.allocations || []).map((alloc: any, i: number) => (
              <div key={alloc.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-300 font-semibold font-sans">{alloc.name}</span>
                </div>
                <span className="font-bold text-white">{alloc.pct}% (${alloc.value?.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily P&L Volatility Distribution Bar Chart */}
      <div className="bg-[#0c1220] border border-[#18263f] p-3 sm:p-4 rounded-xl">
        <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mb-2.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          Daily Realized Profit / Loss Volatility Distribution
        </h2>

        <div className="h-36 sm:h-40 w-full font-mono-num">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portfolio?.equity_curve?.slice(-14) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.4} />
              <XAxis dataKey="date" stroke="#50617b" fontSize={9.5} tickLine={false} />
              <YAxis stroke="#50617b" fontSize={9.5} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e2b45",
                  fontSize: "11px",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="daily_pnl">
                {(portfolio?.equity_curve?.slice(-14) || []).map((entry: any, index: number) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.daily_pnl >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
