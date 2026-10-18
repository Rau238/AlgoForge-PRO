"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { PositionsSkeleton } from "@/components/common/PageSkeletons";
import {
  Crosshair,
  TrendingUp,
  ShieldAlert,
  Target,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  RefreshCw,
  Building2,
  Zap,
  Activity,
  Layers,
  Percent,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function PositionsPage() {
  const { liveQuotes, setSelectedSymbol, positions: storePositions, setPositions: setStorePositions, account, updateAccount } = useAlgoForgeStore();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifyModal, setModifyModal] = useState<any | null>(null);
  const [newSL, setNewSL] = useState<number>(0);
  const [newTP1, setNewTP1] = useState<number>(0);
  const [newTP2, setNewTP2] = useState<number>(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data || []);
      setStorePositions(data || []);
      const port = await api.getPortfolio();
      if (port) {
        const acc = port.account || port;
        if (acc.balance !== undefined) {
          updateAccount(acc);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Prefer store positions which are updated in real-time via WebSocket
  const effectivePositions = storePositions && storePositions.length > 0 ? storePositions : positions;

  // Real-time calculated telemetry metrics
  const totalUnrealizedPnl = useMemo(() => {
    return effectivePositions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  }, [effectivePositions]);

  const totalUsedMargin = useMemo(() => {
    return effectivePositions.reduce((acc, p) => acc + (p.initial_margin || 0), 0);
  }, [effectivePositions]);

  const handleBreakeven = async (posId: number) => {
    try {
      await api.modifyPosition(posId, { action: "BREAKEVEN" });
      setActionNotice("Position stop loss moved to Breakeven!");
      setTimeout(() => setActionNotice(null), 3000);
      await loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async (posId: number) => {
    try {
      await api.modifyPosition(posId, { action: "CLOSE" });
      setActionNotice("Position closed at market price!");
      setTimeout(() => setActionNotice(null), 3000);
      await loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePartialClose = async (posId: number, pct: number) => {
    try {
      await api.modifyPosition(posId, { action: "CLOSE", partial_pct: pct });
      setActionNotice(`Closed ${pct}% of position on Delta Exchange!`);
      setTimeout(() => setActionNotice(null), 3000);
      await loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyModal) return;
    try {
      await api.modifyPosition(modifyModal.id, {
        stop_loss: newSL,
        tp1: newTP1,
        tp2: newTP2,
      });
      setActionNotice("Protection & TP levels updated successfully on Delta Exchange!");
      setTimeout(() => setActionNotice(null), 4000);
      setModifyModal(null);
      await loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && effectivePositions.length === 0) {
    return <PositionsSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title & Exchange Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              Open Positions Desk
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Delta Exchange
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400">
            Real-time mark-to-market P&L & isolated leverage management
          </p>
        </div>

        <button
          onClick={loadPositions}
          className="px-3 py-1.5 bg-[#121b2f] hover:bg-[#17233c] text-cyan-300 rounded-lg text-xs font-bold border border-cyan-900/60 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Institutional Metric Cards (Clean flat styling, no shadows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono-num">
        <div className="bg-[#0b1222] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block font-sans mb-0.5">
            Open Positions
          </span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums">
            {effectivePositions.length} <span className="text-[10.5px] font-normal text-slate-400">Contracts</span>
          </span>
        </div>

        <div className="bg-[#0b1222] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block font-sans mb-0.5">
            Allocated Margin
          </span>
          <span className="text-base sm:text-lg font-black text-cyan-300 tabular-nums">
            ${totalUsedMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#0b1222] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block font-sans mb-0.5">
            Total Unrealized P&L
          </span>
          <span
            className={`text-base sm:text-lg font-black tabular-nums flex items-center gap-1.5 ${
              totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                totalUnrealizedPnl >= 0 ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {totalUnrealizedPnl >= 0 ? "+" : ""}${totalUnrealizedPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#0b1222] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block font-sans mb-0.5">
            Net Account Equity
          </span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums">
            ${(account.balance + totalUnrealizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Redesigned Streamlined Positions Table (7 Clear Columns, No Horizontal Scroll Overload) */}
      <div className="bg-[#090e1a] border border-[#16233a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono-num select-none">
            <thead>
              <tr className="bg-[#060a12] border-b border-[#16233a] text-[9.5px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                <th className="py-2.5 px-3 text-left">Instrument & Side</th>
                <th className="py-2.5 px-3 text-left">Size & Margin</th>
                <th className="py-2.5 px-3 text-right">Entry Price</th>
                <th className="py-2.5 px-3 text-right">Live Price</th>
                <th className="py-2.5 px-3 text-right">Safety (SL / TP)</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-3 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121c2e]">
              {effectivePositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs font-sans">
                    No active positions open. Launch algorithmic trades from the Chart or Auto-Pilot Bot.
                  </td>
                </tr>
              ) : (
                effectivePositions.map((p) => {
                  const isLong = p.direction === "LONG";
                  const currentQuote = liveQuotes[p.symbol];
                  const curPrice = currentQuote?.price || p.current_price || p.entry_price;
                  const diff = isLong ? (curPrice - p.entry_price) : (p.entry_price - curPrice);
                  const livePnl = Math.round(diff * p.quantity * 100) / 100;
                  const livePnlPct = Math.round((diff / (p.entry_price || 1)) * 10000) / 100;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#0d1424] transition-colors"
                    >
                      {/* 1. Instrument & Side */}
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/chart/${p.symbol}`}
                            onClick={() => setSelectedSymbol(p.symbol)}
                            className="font-bold text-white hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <span>{p.symbol}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 hover:text-indigo-400" />
                          </Link>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9.5px] font-black uppercase font-sans ${
                              isLong
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {p.direction} {p.leverage || 25}x
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[180px] mt-0.5">
                          {p.strategy || "Delta Breakout"}
                        </span>
                      </td>

                      {/* 2. Size & Margin */}
                      <td className="py-2 px-3 text-left">
                        <div className="font-bold text-slate-200 tabular-nums">
                          {p.quantity} <span className="text-[10px] font-normal text-slate-400">Contracts</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans tabular-nums">
                          Margin: ${p.initial_margin?.toFixed(2) || "12.50"}
                        </div>
                      </td>

                      {/* 3. Entry Price */}
                      <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                        ${p.entry_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 4. Current Live Price */}
                      <td className="py-2 px-3 text-right font-black text-white tabular-nums">
                        ${curPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 5. Safety Levels (SL & TP) */}
                      <td className="py-2 px-3 text-right tabular-nums">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-[10px] text-slate-400 font-sans">SL:</span>
                          <span className="text-rose-400 font-bold">
                            ${p.stop_loss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {p.breakeven_moved && (
                            <span className="text-[8.5px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-black font-sans">
                              BE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end space-x-1 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-sans">TP:</span>
                          <span className="text-emerald-400 font-bold">
                            ${p.tp1?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* 6. Real-Time P&L */}
                      <td className="py-2 px-3 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-black inline-block ${
                              livePnl >= 0
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                            }`}
                          >
                            {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)} ({livePnl >= 0 ? "+" : ""}{livePnlPct.toFixed(2)}%)
                          </span>
                        </div>
                      </td>

                      {/* 7. Clean Action Buttons */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleBreakeven(p.id)}
                            disabled={p.breakeven_moved}
                            className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold disabled:opacity-30 transition-all font-sans cursor-pointer"
                            title="Move Stop Loss to Entry Price (Break-Even)"
                          >
                            BE
                          </button>
                          <button
                            onClick={() => {
                              setModifyModal(p);
                              setNewSL(p.stop_loss);
                              setNewTP1(p.tp1 || 0);
                              setNewTP2(p.tp2 || 0);
                            }}
                            className="px-2 py-1 bg-[#121c2e] hover:bg-[#18263e] text-slate-200 border border-[#1e2d47] rounded text-[10px] font-bold transition-all font-sans cursor-pointer"
                            title="Edit Stop Loss & Take Profit"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => handleClose(p.id)}
                            className="px-2 py-1 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/35 rounded text-[10px] font-bold transition-all font-sans cursor-pointer"
                            title="Close Position at Market Price"
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modify Protection Levels Modal */}
      {modifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-[#1b2a45] rounded-xl p-5 w-full max-w-md space-y-4 font-mono-num select-none">
            <div className="flex items-center justify-between border-b border-[#18263f] pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Modify Protection Levels &bull; {modifyModal.symbol}
                </h3>
              </div>
              <button
                onClick={() => setModifyModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModify} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-sans">
                  Stop Loss Price ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newSL}
                  onChange={(e) => setNewSL(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#060a12] border border-rose-500/40 rounded px-3 py-2 text-rose-300 font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-sans">
                  Take Profit 1 ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newTP1}
                  onChange={(e) => setNewTP1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#060a12] border border-emerald-500/40 rounded px-3 py-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-sans">
                  Take Profit 2 ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newTP2}
                  onChange={(e) => setNewTP2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#060a12] border border-emerald-500/40 rounded px-3 py-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModifyModal(null)}
                  className="px-3 py-2 rounded-lg bg-[#121b2f] hover:bg-[#1a2744] text-slate-300 text-xs font-bold border border-[#1b2a45] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Levels</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
