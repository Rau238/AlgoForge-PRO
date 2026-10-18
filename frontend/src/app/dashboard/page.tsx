"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ShieldCheck,
  Percent,
  Crosshair,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Activity,
  Cpu,
  SlidersHorizontal,
  CandlestickChart,
  Globe2,
  Coins,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DashboardSkeleton } from "@/components/common/PageSkeletons";

export default function DashboardPage() {
  const { account, liveQuotes, setSelectedSymbol, setIsAiChatOpen, setIsTradePlannerOpen } =
    useAlgoForgeStore();
  const [positions, setPositions] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("30D");

  useEffect(() => {
    async function loadData() {
      try {
        const [posRes, stratRes, portRes] = await Promise.all([
          api.getPositions(),
          api.getStrategies(),
          api.getPortfolio(),
        ]);
        setPositions(posRes || []);
        setStrategies(stratRes || []);
        setPortfolioData(portRes || null);
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tradableAssetsConfig = [
    { symbol: "BTCUSDT", name: "Bitcoin", type: "CRYPTO", basePrice: 81950.0, baseChange: 0.45, signal: "BUY" },
    { symbol: "ETHUSDT", name: "Ethereum", type: "CRYPTO", basePrice: 2435.5, baseChange: 1.42, signal: "BUY" },
    { symbol: "SOLUSDT", name: "Solana", type: "CRYPTO", basePrice: 104.35, baseChange: -0.78, signal: "BUY" },
    { symbol: "XAUUSD", name: "Gold Spot", type: "COMMODITIES", basePrice: 4180.35, baseChange: 0.26, signal: "BUY" },
    { symbol: "XAGUSD", name: "Silver Spot", type: "COMMODITIES", basePrice: 31.85, baseChange: 1.15, signal: "BUY" },
    { symbol: "USOIL", name: "Crude Oil (WTI)", type: "COMMODITIES", basePrice: 99.02, baseChange: 2.61, signal: "HOLD" },
  ];

  const totalReturn = account.equity - 100.0;
  const totalReturnPct = ((account.equity - 100.0) / 100.0) * 100;
  const dailyReturnPct = account.balance > 0 ? (account.todaysPnl / account.balance) * 100 : 0;
  const isPosDay = account.todaysPnl >= 0;
  const isPosReturn = totalReturn >= 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Welcome & Quick Action Hero Banner */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3 sm:p-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-0.5">
              <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Execution
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">&bull;</span>
              <span className="text-slate-400 text-[10px] font-mono hidden sm:inline">
                $100.00 Capital Desk
              </span>
            </div>

            <h1 className="text-base font-bold text-white tracking-tight">
              Command Dashboard
            </h1>
            <p className="text-[11px] text-slate-400 font-mono-num tabular-nums">
              {positions.length} active positions &bull; Today: <span className={isPosDay ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{isPosDay ? "+" : ""}${account.todaysPnl.toFixed(2)} ({isPosDay ? "+" : ""}{dailyReturnPct.toFixed(1)}%)</span>
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Link
              href="/chart/BTCUSDT"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Live Chart</span>
            </Link>

            <button
              onClick={() => setIsTradePlannerOpen(true)}
              className="px-3 py-1.5 bg-[#121b2f] hover:bg-[#17233c] text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Planner</span>
            </button>

            <button
              onClick={() => setIsAiChatOpen(true)}
              className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Hero Cards (Clean, flat, tabular-nums, no shadows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Account Equity */}
        <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Account Value (Equity)</span>
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono-num tabular-nums tracking-tight">
            ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5 text-[11px]">
            <span className={`font-bold font-mono-num tabular-nums flex items-center ${isPosReturn ? "text-emerald-400" : "text-rose-400"}`}>
              {isPosReturn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPosReturn ? "+" : ""}${totalReturn.toFixed(2)} ({isPosReturn ? "+" : ""}{totalReturnPct.toFixed(1)}%)
            </span>
            <span className="text-slate-500">• Net Return</span>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's P&L</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono-num tabular-nums tracking-tight ${isPosDay ? "text-emerald-400" : "text-rose-400"}`}>
            {isPosDay ? "+" : ""}${account.todaysPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5 text-[11px]">
            <span className={`px-1.5 py-0.2 rounded font-bold font-mono-num tabular-nums text-[10px] ${isPosDay ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
              {isPosDay ? "+" : ""}{dailyReturnPct.toFixed(1)}% TODAY
            </span>
            <span className="text-slate-400">• {positions.length} positions</span>
          </div>
        </div>

        {/* Card 3: Active Trades */}
        <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Open Trades</span>
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Crosshair className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono-num tabular-nums tracking-tight flex items-baseline gap-1.5">
            <span>{positions.length}</span>
            <span className="text-xs text-slate-400 font-normal">Active Positions</span>
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400 font-mono-num tabular-nums">
            <span className="text-emerald-400 font-bold">{positions.filter((p) => p.direction === "LONG").length} Long</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{positions.filter((p) => p.direction === "SHORT").length} Short</span>
            <span>• Isolated 25x</span>
          </div>
        </div>

        {/* Card 4: Win Rate & Safety */}
        <div className="bg-[#0c1220] border border-[#18263f] p-3.5 rounded-xl group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Algorithm Win Rate</span>
            <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono-num tabular-nums tracking-tight flex items-baseline gap-1.5">
            <span className="text-cyan-400">{account.winRate}%</span>
            <span className="text-xs text-slate-400 font-normal">Audited Rate</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5 text-[11px] text-slate-400 font-mono-num tabular-nums">
            <span>Profit Factor: <strong className="text-white">{account.profitFactor}</strong></span>
            <span>• Max DD ({account.maxDrawdown}%)</span>
          </div>
        </div>
      </div>

      {/* Interactive Portfolio Growth Curve */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-2.5 border-b border-[#1e2b45] gap-2">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Account Equity Growth & Net Liquidation Value
            </h2>
            <p className="text-[11px] text-slate-400">
              30-day historical net liquidation trajectory with automated algorithmic executions
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-[#080c14] border border-[#1e2b45] rounded-lg p-0.5 text-xs">
            {(["7D", "30D", "ALL"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 sm:h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData?.equity_curve || []}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.4} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickLine={false}
                tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e2b45",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Equity"]}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#equityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Open Trades & Active Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Open Trades Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#18263f]">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                Active Open Trades ({positions.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Live positions managed with automated TP/SL execution
              </p>
            </div>
            <Link
              href="/positions"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>Manage Positions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono-num">
              <thead>
                <tr className="border-b border-[#18263f] text-[10px] text-slate-400 uppercase font-semibold bg-[#0a0f1d] tracking-wider font-sans">
                  <th className="py-2 px-2.5 text-left">Symbol</th>
                  <th className="py-2 px-2.5 text-center">Side</th>
                  <th className="py-2 px-2.5 text-right">Entry</th>
                  <th className="py-2 px-2.5 text-right">Live Price</th>
                  <th className="py-2 px-2.5 text-right">Stop Loss</th>
                  <th className="py-2 px-2.5 text-right">TP1</th>
                  <th className="py-2 px-2.5 text-right">Unrealized P&L</th>
                  <th className="py-2 px-2.5 text-center">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151e30]">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-sans">
                      No active positions open.
                    </td>
                  </tr>
                ) : (
                  positions.map((p) => {
                    const isLong = p.direction === "LONG";
                    const liveQuote = liveQuotes[p.symbol];
                    const curPrice = liveQuote?.price || p.current_price || p.entry_price;
                    const diff = isLong ? (curPrice - p.entry_price) : (p.entry_price - curPrice);
                    const pnl = Math.round(diff * p.quantity * 100) / 100;

                    return (
                      <tr key={p.id} className="hover:bg-[#121b2f] transition-colors">
                        <td className="py-2 px-2.5 font-bold text-white text-left font-sans">
                          {p.symbol}
                        </td>
                        <td className="py-2 px-2.5 text-center font-sans">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black inline-block min-w-[42px] ${
                              isLong
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {p.direction}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-300 text-right tabular-nums">
                          ${p.entry_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-white text-right tabular-nums">
                          ${curPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5 text-rose-400 text-right tabular-nums">
                          ${p.stop_loss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5 text-emerald-400 text-right tabular-nums">
                          ${p.tp1?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-right tabular-nums">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[11px] ${
                              pnl >= 0
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center font-sans">
                          <Link
                            href={`/chart/${p.symbol}`}
                            onClick={() => setSelectedSymbol(p.symbol)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                          >
                            View &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Automated Strategies (1 Col) */}
        <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#18263f]">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Running Strategies
                </h3>
                <p className="text-[11px] text-slate-400">Algorithms currently active</p>
              </div>
              <Link
                href="/strategies"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Hub &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {strategies.slice(0, 3).map((strat) => (
                <div
                  key={strat.id}
                  className="p-2.5 bg-[#080c14] border border-[#18263f] rounded-lg hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{strat.name}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {strat.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] pt-1.5 border-t border-[#18263f] font-mono-num tabular-nums">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-sans">Trades:</span>
                      <strong className="text-white">{strat.trades}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-sans">Win Rate:</span>
                      <strong className="text-emerald-400">{strat.win_rate}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-sans">Net P&L:</span>
                      <strong className="text-emerald-400">+${strat.net_pnl}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/strategy-builder"
            className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center text-xs transition-all block active:scale-95 cursor-pointer"
          >
            + Create New Strategy
          </Link>
        </div>
      </div>

      {/* Top Tradable Instruments (Quick Watch) */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1e2b45]">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Markets Quick Watch
            </h3>
            <p className="text-[11px] text-slate-400">Click any instrument to jump to live TradingView chart</p>
          </div>
          <Link href="/markets" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">
            All Markets &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {tradableAssetsConfig.map((item) => {
            const q = liveQuotes[item.symbol];
            const price = q?.price || item.basePrice;
            const change = q?.change_24h !== undefined ? q.change_24h : item.baseChange;

            return (
              <Link
                key={item.symbol}
                href={`/chart/${item.symbol}`}
                onClick={() => setSelectedSymbol(item.symbol)}
                className="p-2.5 bg-[#080c14] border border-[#1e2b45] rounded-xl hover:border-indigo-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs group-hover:text-indigo-300 font-mono-num">
                    {item.symbol}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                      item.type === "CRYPTO"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                <div className="text-xs sm:text-sm font-extrabold text-white my-0.5 font-mono-num">
                  ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1e2b45]">
                  <span
                    className={`font-mono-num font-bold ${
                      change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </span>
                  <span className="text-[9px] text-indigo-400 font-bold group-hover:underline">
                    Trade &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
