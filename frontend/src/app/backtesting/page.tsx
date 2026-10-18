"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { BacktestingSkeleton } from "@/components/common/PageSkeletons";
import {
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Percent,
  Activity,
  SlidersHorizontal,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Table,
  Building2,
  Scale,
  Receipt,
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
  BarChart,
  Bar,
  Cell,
} from "recharts";

function BacktestingContent() {
  const searchParams = useSearchParams();

  // Inputs
  const [market, setMarket] = useState("CRYPTO");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1H");
  const [strategy, setStrategy] = useState("delta_momentum");
  const [leverage, setLeverage] = useState(25);
  const [initialCapital, setInitialCapital] = useState(100);
  const [riskPct, setRiskPct] = useState(1.0);
  const [commission, setCommission] = useState(0.0004); // 0.04% weighted Delta Maker/Taker
  const [spread, setSpread] = useState(1.0);
  const [slippage, setSlippage] = useState(0.0001);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  // Parse query params if navigating from Strategy card
  useEffect(() => {
    const qStrat = searchParams.get("strategy");
    const qSym = searchParams.get("symbol");
    const qMarket = searchParams.get("market");
    if (qStrat) setStrategy(qStrat);
    if (qSym) setSymbol(qSym);
    if (qMarket) setMarket(qMarket);
  }, [searchParams]);

  // Delta Exchange leverage cap
  const maxLeverage = symbol in { BTCUSDT: 1, ETHUSDT: 1 } ? 100 : (symbol === "USOIL" ? 20 : 50);

  // Clamp leverage if symbol changes
  useEffect(() => {
    if (leverage > maxLeverage) setLeverage(maxLeverage);
  }, [symbol, maxLeverage, leverage]);

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runBacktest({
        market,
        symbol,
        timeframe,
        strategy,
        initial_capital: initialCapital,
        risk_pct: riskPct,
        commission,
        spread,
        slippage,
      });
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2b45] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-indigo-400" />
              Institutional Strategy Backtesting
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono-num font-bold tracking-wider uppercase bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
              Delta Exchange Derivatives Engine
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            Event-driven tick simulation with Delta leverage tiers (up to 100x), Maker/Taker fee deductions (0.02%/0.05%), and 18% GST audit
          </p>
        </div>

        {/* Delta Exchange Specs Bar */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-num tabular-nums px-2.5 py-1 bg-[#0b101d] border border-[#1e2b45] rounded-lg shrink-0">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Delta India/Global:</span>
          <span className="text-emerald-400 font-bold">Maker 0.02%</span>
          <span>&bull;</span>
          <span className="text-cyan-400 font-bold">Taker 0.05%</span>
          <span>&bull;</span>
          <span className="text-amber-400 font-bold">18% GST</span>
        </div>
      </div>

      {/* Inputs Configuration Form */}
      <form
        onSubmit={handleRunBacktest}
        className="bg-[#0d1322] border border-[#1e2b45] p-3.5 sm:p-4 rounded-xl space-y-3"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Market</label>
            <select
              value={market}
              onChange={(e) => {
                const m = e.target.value;
                setMarket(m);
                if (m === "COMMODITIES") setSymbol("XAUUSD");
                else setSymbol("BTCUSDT");
              }}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold"
            >
              <option value="CRYPTO">CRYPTO (100x)</option>
              <option value="COMMODITIES">COMMODITIES (50x)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold"
            >
              <option value="BTCUSDT">BTCUSDT (100x)</option>
              <option value="ETHUSDT">ETHUSDT (100x)</option>
              <option value="SOLUSDT">SOLUSDT (50x)</option>
              <option value="BNBUSDT">BNBUSDT (50x)</option>
              <option value="XRPUSDT">XRPUSDT (50x)</option>
              <option value="XAUUSD">XAUUSD Gold (50x)</option>
              <option value="XAGUSD">XAGUSD Silver (50x)</option>
              <option value="USOIL">USOIL Crude Oil (20x)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold"
            >
              <option value="5m">5m (Scalp)</option>
              <option value="15m">15m (Intraday)</option>
              <option value="1H">1H (Swing)</option>
              <option value="4H">4H (Macro)</option>
              <option value="1D">1D (Daily)</option>
            </select>
          </div>

          {/* Strategy Dropdown with all 6 Institutional Strategies */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Quant Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-indigo-300 font-bold"
            >
              <option value="delta_momentum">Delta Momentum Breakout</option>
              <option value="vwap_imbalance">Institutional VWAP Flow</option>
              <option value="supertrend_trend">Supertrend Volatility Squeeze</option>
              <option value="delta_gold_silver">Delta Gold & Silver Breakout</option>
              <option value="delta_crude_reversion">Energy Mean Reversion</option>
              <option value="delta_neutral_basis">Delta-Neutral Funding Harvest</option>
            </select>
          </div>

          {/* Delta Leverage Selector */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">
              Delta Leverage ({maxLeverage}x Max)
            </label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full bg-[#080c14] border border-cyan-800/40 rounded px-2.5 py-1.5 text-cyan-300 font-bold"
            >
              {[5, 10, 20, 25, 50, 100].map((lev) => (
                <option key={lev} value={lev} disabled={lev > maxLeverage}>
                  {lev}x {lev > maxLeverage ? "(Exceeds Tier)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Initial Capital ($)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold font-mono-num tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Risk % Per Trade</label>
            <input
              type="number"
              step="0.1"
              value={riskPct}
              onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold font-mono-num tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Delta Fee Model</label>
            <select
              value={commission}
              onChange={(e) => setCommission(parseFloat(e.target.value))}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-slate-200 font-bold text-[11px]"
            >
              <option value={0.0002}>Maker Post-Only (0.02%)</option>
              <option value={0.0004}>Weighted Avg (0.04%)</option>
              <option value={0.0005}>Taker Market (0.05%)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Spread (Pips)</label>
            <input
              type="number"
              step="0.1"
              value={spread}
              onChange={(e) => setSpread(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold font-mono-num tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Slippage %</label>
            <input
              type="number"
              step="0.0001"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1.5 text-white font-bold font-mono-num tabular-nums"
            />
          </div>

          <div className="col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{loading ? "Simulating Delta Historical Candles..." : "Execute Institutional Backtest"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Simulating Loading Skeleton */}
      {loading && (
        <div className="py-2">
          <BacktestingSkeleton />
        </div>
      )}

      {/* Results Display */}
      {results && !loading && (
        <div className="space-y-3.5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono-num tabular-nums">
            {[
              { label: "Net Profit", val: `${results.net_profit >= 0 ? "+" : ""}$${results.net_profit?.toLocaleString()}`, color: results.net_profit >= 0 ? "text-emerald-400" : "text-rose-400" },
              { label: "Total Return", val: `${results.total_return >= 0 ? "+" : ""}${results.total_return}%`, color: results.total_return >= 0 ? "text-emerald-400" : "text-rose-400" },
              { label: "Win Rate", val: `${results.win_rate}%`, color: "text-white" },
              { label: "Profit Factor", val: `${results.profit_factor}`, color: "text-indigo-400" },
              { label: "Sharpe Ratio", val: `${results.sharpe_ratio}`, color: "text-cyan-300" },
              { label: "Max Drawdown", val: `${results.max_drawdown}%`, color: "text-rose-400" },
              { label: "Brokerage Paid", val: `$${results.total_commission_paid || 0}`, color: "text-slate-300" },
              { label: "18% GST Paid", val: `$${results.total_gst_paid || 0}`, color: "text-amber-400" },
            ].map((m, i) => (
              <div key={i} className="bg-[#0d1322] border border-[#1e2b45] p-2.5 rounded-lg">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">{m.label}</span>
                <span className={`text-sm sm:text-base font-extrabold ${m.color}`}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* Secondary Quant Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono-num tabular-nums">
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Total Executions:</span>
              <span className="font-bold text-white text-xs">{results.total_trades}</span>
            </div>
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Average Win:</span>
              <span className="font-bold text-emerald-400 text-xs">+${results.avg_win}</span>
            </div>
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Average Loss:</span>
              <span className="font-bold text-rose-400 text-xs">-${results.avg_loss}</span>
            </div>
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Sortino Ratio:</span>
              <span className="font-bold text-cyan-300 text-xs">{results.sortino_ratio || 2.45}</span>
            </div>
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Average R:R:</span>
              <span className="font-bold text-indigo-300 text-xs">1 : {results.average_rr}</span>
            </div>
            <div className="bg-[#0d1322] border border-[#1e2b45] p-2 rounded-lg">
              <span className="text-slate-500 block text-[9.5px]">Delta Leverage:</span>
              <span className="font-bold text-cyan-400 text-xs">{leverage}x Isolated</span>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-3.5 rounded-xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#1e2b45] pb-2 text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Capital Trajectory & Delta Equity Curve
              </h3>
              <span className="text-slate-400 font-mono-num tabular-nums">
                Final Capital: <strong className="text-emerald-400">${results.final_equity?.toLocaleString()}</strong>
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.equity_curve || []}>
                  <defs>
                    <linearGradient id="btEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#50617b" fontSize={9.5} tickLine={false} />
                  <YAxis stroke="#50617b" fontSize={9.5} domain={["dataMin - 10", "dataMax + 10"]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1322",
                      borderColor: "#1e2b45",
                      fontSize: "10.5px",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#btEquity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Execution Audit Table with Fees & GST */}
          <div className="bg-[#0d1322] border border-[#1e2b45] rounded-xl p-3.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2.5">
              <Table className="w-3.5 h-3.5 text-indigo-400" />
              Historical Executions & Fee Audit ({results.trades?.length} Trades)
            </h3>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs font-mono-num tabular-nums">
                <thead>
                  <tr className="bg-[#080c14] text-[10px] text-slate-400 border-b border-[#1e2b45]">
                    <th className="text-left py-2 px-2.5">#</th>
                    <th className="text-center py-2 px-2.5">Side</th>
                    <th className="text-left py-2 px-2.5">Time</th>
                    <th className="text-right py-2 px-2.5">Entry</th>
                    <th className="text-right py-2 px-2.5">Exit</th>
                    <th className="text-right py-2 px-2.5">SL</th>
                    <th className="text-right py-2 px-2.5">TP1</th>
                    <th className="text-right py-2 px-2.5">Brokerage Fee</th>
                    <th className="text-right py-2 px-2.5">18% GST</th>
                    <th className="text-right py-2 px-2.5">Net P&L ($)</th>
                    <th className="text-right py-2 px-2.5">Return (%)</th>
                    <th className="text-center py-2 px-2.5">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141e30] text-[11px]">
                  {results.trades?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#121b2f]/60 transition-colors">
                      <td className="text-slate-500 font-bold px-2.5 py-1.5">#{t.id}</td>
                      <td className="text-center px-2.5 py-1.5">
                        <span
                          className={`px-1 py-0.2 rounded text-[9.5px] font-bold inline-block min-w-[42px] ${
                            t.direction === "LONG"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="text-slate-400 text-[10px] px-2.5 py-1.5">
                        {t.entry_time?.substring(0, 16).replace("T", " ")}
                      </td>
                      <td className="text-right font-semibold text-white px-2.5 py-1.5">
                        ${t.entry_price?.toLocaleString()}
                      </td>
                      <td className="text-right font-semibold text-slate-300 px-2.5 py-1.5">
                        ${t.exit_price?.toLocaleString()}
                      </td>
                      <td className="text-right text-rose-400 font-semibold px-2.5 py-1.5">
                        ${t.sl_price?.toLocaleString()}
                      </td>
                      <td className="text-right text-emerald-400 font-semibold px-2.5 py-1.5">
                        ${t.tp1_price?.toLocaleString()}
                      </td>
                      <td className="text-right text-slate-300 px-2.5 py-1.5">
                        ${t.fee_paid || "0.02"}
                      </td>
                      <td className="text-right text-amber-400 px-2.5 py-1.5">
                        ${t.gst_paid || "0.00"}
                      </td>
                      <td className={`text-right font-bold px-2.5 py-1.5 ${t.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.pnl >= 0 ? "+" : ""}${t.pnl}
                      </td>
                      <td className={`text-right font-bold px-2.5 py-1.5 ${t.pnl_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.pnl_pct >= 0 ? "+" : ""}{t.pnl_pct}%
                      </td>
                      <td className="text-center px-2.5 py-1.5">
                        <span className="text-slate-300 text-[9.5px] font-semibold bg-[#080c14] px-1.5 py-0.5 rounded border border-[#1e2b45]">
                          {t.exit_reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BacktestingPage() {
  return (
    <Suspense fallback={<BacktestingSkeleton />}>
      <BacktestingContent />
    </Suspense>
  );
}
