"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Percent,
  ShieldAlert,
  Activity,
  Award,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { AnalyticsSkeleton } from "@/components/common/PageSkeletons";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overview = data?.overview || {
    win_rate: 68.4,
    profit_factor: 1.92,
    expectancy: 184.2,
    average_rr: 2.3,
    average_win: 320.5,
    average_loss: 145.2,
    max_drawdown: 7.2,
    recovery_factor: 3.42,
    sharpe_ratio: 2.14,
    sortino_ratio: 2.89,
    total_trades: 248,
  };

  const bests = data?.best_attributes || {
    best_strategy: "EMA Crossover + RSI",
    best_instrument: "BTCUSDT",
    best_timeframe: "1H",
    best_session: "London / NY Overlap",
    best_direction: "LONG (72.4% win rate)",
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="flex-1 p-5 space-y-5 overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Performance Analytics
          </h1>
          <p className="text-[11px] text-slate-400">
            Statistical edge, risk-adjusted returns & attribution metrics
          </p>
        </div>
      </div>

      {/* Top 10 Quantitative Risk & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Win Rate", val: `${overview.win_rate}%`, sub: "170W / 78L", color: "text-emerald-400" },
          { label: "Profit Factor", val: `${overview.profit_factor}`, sub: "Gross Profit / Loss", color: "text-indigo-400" },
          { label: "Mathematical Expectancy", val: `+$${overview.expectancy}`, sub: "Avg per Trade", color: "text-emerald-400" },
          { label: "Average Risk/Reward", val: `1 : ${overview.average_rr}`, sub: "Realized Multiplier", color: "text-white" },
          { label: "Max Drawdown", val: `${overview.max_drawdown}%`, sub: "Peak-to-Trough", color: "text-rose-400" },
          { label: "Average Win", val: `+$${overview.average_win}`, sub: "Winning Trades", color: "text-emerald-400" },
          { label: "Average Loss", val: `-$${overview.average_loss}`, sub: "Losing Trades", color: "text-rose-400" },
          { label: "Recovery Factor", val: `${overview.recovery_factor}`, sub: "Net PnL / Max DD", color: "text-indigo-400" },
          { label: "Sharpe Ratio", val: `${overview.sharpe_ratio}`, sub: "Annualized R-Free", color: "text-white" },
          { label: "Sortino Ratio", val: `${overview.sortino_ratio}`, sub: "Downside Volatility", color: "text-white" },
        ].map((m, i) => (
          <div key={i} className="bg-[#0d1322] border border-[#1e2b45] p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">{m.label}</span>
            <div className={`text-base font-extrabold ${m.color}`}>{m.val}</div>
            <span className="text-[10px] text-gray-400">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Best Performing Attributes Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#0d1322] to-emerald-950/40 border border-[#1e2b45] p-4 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-bold block">Best Strategy</span>
          <span className="font-extrabold text-white text-sm">{bests.best_strategy}</span>
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-bold block">Best Instrument</span>
          <span className="font-extrabold text-emerald-400 text-sm">{bests.best_instrument}</span>
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-bold block">Best Timeframe</span>
          <span className="font-extrabold text-indigo-400 text-sm">{bests.best_timeframe}</span>
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-bold block">Best Trading Session</span>
          <span className="font-extrabold text-white text-sm">{bests.best_session}</span>
        </div>
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-bold block">Best Direction</span>
          <span className="font-extrabold text-emerald-400 text-sm">{bests.best_direction}</span>
        </div>
      </div>

      {/* Performance by Hour of Day & Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance by Hour */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            Performance by Session Hour (UTC)
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.by_hour || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.4} />
                <XAxis dataKey="hour" stroke="#50617b" fontSize={9} tickLine={false} />
                <YAxis stroke="#50617b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1322",
                    borderColor: "#1e2b45",
                    fontSize: "11px",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="pnl" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance by Day of Week */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Performance by Day of Week
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.by_day || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.4} />
                <XAxis dataKey="day" stroke="#50617b" fontSize={10} tickLine={false} />
                <YAxis stroke="#50617b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1322",
                    borderColor: "#1e2b45",
                    fontSize: "11px",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="pnl" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Grids: By Strategy & By Symbol */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Strategy Table */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Attribution by Strategy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full trading-table text-xs">
              <thead>
                <tr className="bg-[#0a0f1d]">
                  <th className="text-left py-2 px-3">Strategy</th>
                  <th className="text-right py-2 px-3">Trades</th>
                  <th className="text-right py-2 px-3">Win Rate</th>
                  <th className="text-right py-2 px-3">Profit Factor</th>
                  <th className="text-right py-2 px-3">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141e30]">
                {data?.by_strategy?.map((s: any) => (
                  <tr key={s.strategy} className="hover:bg-[#121b2f]/60 transition-colors">
                    <td className="font-bold text-white px-3 py-2 text-left">{s.strategy}</td>
                    <td className="text-right font-mono-num font-semibold text-white px-3 py-2">{s.trades}</td>
                    <td className="text-right font-mono-num text-emerald-400 font-bold px-3 py-2">{s.win_rate}%</td>
                    <td className="text-right font-mono-num text-indigo-400 font-bold px-3 py-2">{s.profit_factor}</td>
                    <td className="text-right font-mono-num text-emerald-400 font-extrabold px-3 py-2">+${s.pnl?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Symbol Table */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            Attribution by Instrument
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full trading-table text-xs">
              <thead>
                <tr className="bg-[#0a0f1d]">
                  <th className="text-left py-2 px-3">Symbol</th>
                  <th className="text-center py-2 px-3">Market</th>
                  <th className="text-right py-2 px-3">Trades</th>
                  <th className="text-right py-2 px-3">Win Rate</th>
                  <th className="text-right py-2 px-3">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141e30]">
                {data?.by_symbol?.map((s: any) => (
                  <tr key={s.symbol} className="hover:bg-[#121b2f]/60 transition-colors">
                    <td className="font-bold text-white px-3 py-2 text-left font-mono-num">{s.symbol}</td>
                    <td className="text-center px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.market === "CRYPTO" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        }`}
                      >
                        {s.market}
                      </span>
                    </td>
                    <td className="text-right font-mono-num font-semibold text-white px-3 py-2">{s.trades}</td>
                    <td className="text-right font-mono-num text-emerald-400 font-bold px-3 py-2">{s.win_rate}%</td>
                    <td className="text-right font-mono-num text-emerald-400 font-extrabold px-3 py-2">+${s.pnl?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
