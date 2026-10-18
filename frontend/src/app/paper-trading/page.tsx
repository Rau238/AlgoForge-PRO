"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import {
  History,
  TrendingUp,
  ShieldAlert,
  Target,
  DollarSign,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  Crosshair,
  Play,
  Flame,
  Zap,
} from "lucide-react";

export default function PaperTradingPage() {
  const { account, updateAccount, liveQuotes, setSelectedSymbol, autoTraderEnabled, setAutoTraderEnabled } = useAlgoForgeStore();
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [deployedStrategies, setDeployedStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pos, ord, port, strats] = await Promise.all([
        api.getPositions(),
        api.getOrders(),
        api.getPortfolio(),
        api.getDeployedStrategies(),
      ]);
      setPositions(pos || []);
      setOrders(ord || []);
      setDeployedStrategies(strats || []);
      if (port) {
        const acc = port.account || port;
        if (acc.balance !== undefined) {
          updateAccount({
            balance: acc.balance,
            equity: acc.equity !== undefined ? acc.equity : acc.balance,
            freeMargin: acc.free_margin !== undefined ? acc.free_margin : (acc.freeMargin || acc.balance),
            usedMargin: acc.used_margin !== undefined ? acc.used_margin : (acc.usedMargin || 0),
            todaysPnl: acc.daily_pnl !== undefined ? acc.daily_pnl : (acc.todaysPnl || 0),
            openPositionsCount: acc.open_positions_count || 0,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDeployAll = async () => {
    setIsProcessing(true);
    try {
      const res = await api.deployAllStrategies();
      setAutoTraderEnabled(true);
      setActionMessage("All 5 Quantitative Strategies successfully deployed and scanning live markets!");
      if (res.strategies) setDeployedStrategies(res.strategies);
      setTimeout(() => setActionMessage(null), 4500);
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(`Deployment error: ${e.message || "Failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleAutoPilot = async () => {
    setIsProcessing(true);
    try {
      const res = await api.toggleAutoTrader();
      if (res && res.enabled !== undefined) {
        setAutoTraderEnabled(res.enabled);
        setActionMessage(res.enabled ? "Auto-Pilot Bot Activated! Live market scanner scanning every 15s." : "Auto-Pilot Bot Paused.");
      } else {
        setAutoTraderEnabled(!autoTraderEnabled);
        setActionMessage(!autoTraderEnabled ? "Auto-Pilot Bot Activated!" : "Auto-Pilot Bot Paused.");
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Clean all previous orders, positions, and P&L data and restart fresh at $100.00 capital?")) return;
    setIsProcessing(true);
    try {
      await api.resetCapital(100.0);
      setActionMessage("All previous orders and positions cleaned. Capital reset to $100.00.");
      setTimeout(() => setActionMessage(null), 4000);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanExecute = async () => {
    setIsProcessing(true);
    try {
      const res = await api.triggerAutoTraderScan();
      setActionMessage(`Scanned 5 assets. Detected ${res.detected_signals?.length || 0} signals, executed ${res.executed_trades?.length || 0} algorithmic orders.`);
      setTimeout(() => setActionMessage(null), 5000);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestAlgo = async () => {
    setIsProcessing(true);
    try {
      const res = await api.testAlgoCycle("BTCUSDT", "Delta Momentum Breakout", 25, "LONG");
      setActionMessage(`Cycle Executed! Realized P&L: +$${res.realized_profit} | Balance: $${res.new_balance.toFixed(2)}`);
      setTimeout(() => setActionMessage(null), 5000);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const activePairs = [
    { symbol: "BTCUSDT", strategy: "Delta Momentum Breakout", leverage: "25x", risk: "$2.00", status: "Active" },
    { symbol: "ETHUSDT", strategy: "EMA Trend Pullback", leverage: "25x", risk: "$1.50", status: "Active" },
    { symbol: "SOLUSDT", strategy: "Volume Mean Reversion", leverage: "20x", risk: "$1.50", status: "Active" },
    { symbol: "XAUUSD", strategy: "Gold Range Breakout", leverage: "20x", risk: "$2.00", status: "Active" },
    { symbol: "USOIL", strategy: "Oil Volatility Squeeze", leverage: "20x", risk: "$1.50", status: "Active" },
  ];

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-400" />
              Paper Trading & Auto-Pilot
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              $100 CAPITAL
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400">
            Real-time algorithmic simulation & autonomous Delta Exchange execution
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleDeployAll}
            disabled={isProcessing}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Deploy all 5 algorithmic strategies across live markets"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Deploy All Strategies</span>
          </button>

          <button
            onClick={handleToggleAutoPilot}
            disabled={isProcessing}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              autoTraderEnabled
                ? "bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300"
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Auto-Pilot: {autoTraderEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={handleScanExecute}
            disabled={isProcessing}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Scan & Auto-Trade</span>
          </button>

          <button
            onClick={handleTestAlgo}
            disabled={isProcessing}
            className="px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Cycle</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="px-2.5 sm:px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ($100)</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Crypto Intelligence & Liquidation Heatmap Callout */}
      <div className="bg-gradient-to-r from-rose-950/40 via-[#0d1527] to-indigo-950/40 border border-[#1e2b45] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">Real-Time Crypto Intelligence &amp; Liquidation Heatmap</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">LIVE</span>
            </div>
            <p className="text-[10.5px] text-slate-400">
              Inspect clustered short/long liquidation walls, squeeze trigger levels, and Alternative.me Fear &amp; Greed sentiment.
            </p>
          </div>
        </div>
        <Link
          href="/crypto-intelligence"
          className="px-3 py-1.5 bg-[#121c32] hover:bg-[#18263f] text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Open Liquidation Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Account Telemetry Cards (MacBook height optimized) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 font-mono-num tabular-nums">
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Paper Balance</span>
          <span className="text-sm sm:text-base font-extrabold text-white">${account.balance.toFixed(2)}</span>
        </div>
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Paper Equity</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-400">${account.equity.toFixed(2)}</span>
        </div>
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Used Margin</span>
          <span className="text-sm sm:text-base font-extrabold text-gray-300">${account.usedMargin.toFixed(2)}</span>
        </div>
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Free Margin</span>
          <span className="text-sm sm:text-base font-extrabold text-indigo-300">${account.freeMargin.toFixed(2)}</span>
        </div>
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Today's P&L</span>
          <span className={`text-sm sm:text-base font-extrabold ${account.todaysPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {account.todaysPnl >= 0 ? "+" : ""}${account.todaysPnl.toFixed(2)}
          </span>
        </div>
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-lg">
          <span className="text-[9.5px] text-gray-400 uppercase font-bold font-sans block mb-0.5">Open Contracts</span>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-extrabold text-white">{positions.length}</span>
            <Link href="/positions" className="text-[10px] text-indigo-400 hover:underline font-sans font-bold flex items-center gap-0.5">
              <span>Desk</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Autonomous Bot Engine Status & Parameters */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#1e2b45]">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs sm:text-sm font-bold text-white">Autonomous Bot Strategies (5 Assets Monitored)</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Loop: 15s scan | Delta Exchange API v2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {activePairs.map((p) => {
            const quote = liveQuotes[p.symbol];
            const curPrice = quote?.price;
            return (
              <div key={p.symbol} className="bg-[#080c14] border border-[#1a253a] p-2.5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/chart/${p.symbol}`}
                      onClick={() => setSelectedSymbol(p.symbol)}
                      className="font-bold text-white text-xs hover:text-indigo-400 flex items-center gap-1 font-mono-num"
                    >
                      <span>{p.symbol}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 text-slate-500" />
                    </Link>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{p.strategy}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#141d2d] flex items-baseline justify-between text-[11px] font-mono-num">
                  <span className="text-slate-400 font-sans text-[10px]">{p.leverage}</span>
                  <span className="text-white font-bold">
                    {curPrice !== undefined ? `$${curPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "..."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Stream & Order Routing (Eliminates duplicate positions table) */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#1e2b45]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold text-white">
              Algorithmic Execution Stream & Signal Log ({orders.length} events)
            </h2>
          </div>
          <Link
            href="/positions"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Manage Active Positions ({positions.length})</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p>No algorithmic orders generated yet. Click "Scan & Auto-Trade" or "Test Cycle" above to execute.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono-num">
              <thead>
                <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[10px] uppercase border-b border-[#1e2b45]">
                  <th className="text-left py-2 px-2.5">Asset</th>
                  <th className="text-left py-2 px-2.5">Strategy</th>
                  <th className="text-center py-2 px-2.5">Side</th>
                  <th className="text-right py-2 px-2.5">Size</th>
                  <th className="text-right py-2 px-2.5">Filled Price</th>
                  <th className="text-right py-2 px-2.5">Stop Loss</th>
                  <th className="text-right py-2 px-2.5">Take Profit</th>
                  <th className="text-center py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141e30]">
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-[#121b2f]/50 transition-colors">
                    <td className="font-bold text-white py-2 px-2.5">
                      <Link href={`/chart/${o.symbol}`} className="hover:underline text-indigo-300">
                        {o.symbol}
                      </Link>
                    </td>
                    <td className="text-slate-300 font-sans text-[11px] py-2 px-2.5">
                      {o.strategy || "Delta Algo"}
                    </td>
                    <td className="text-center py-2 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          o.side === "BUY"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {o.side}
                      </span>
                    </td>
                    <td className="text-right text-white py-2 px-2.5">{o.quantity}</td>
                    <td className="text-right text-slate-200 py-2 px-2.5">
                      ${o.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-rose-400 py-2 px-2.5">
                      ${o.stop_loss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-emerald-400 py-2 px-2.5">
                      ${o.take_profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-center py-2 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                          o.status === "FILLED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

