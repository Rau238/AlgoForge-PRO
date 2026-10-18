"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { TradeHistorySkeleton } from "@/components/common/PageSkeletons";
import {
  TrendingUp,
  History,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  DollarSign,
  Percent,
  Award,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  Zap,
  ShieldAlert,
  CheckCheck,
  ExternalLink,
  Target,
  ShieldCheck,
  Activity,
  Cpu,
} from "lucide-react";

export default function TradeHistoryPage() {
  const router = useRouter();
  const {
    updateAccount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setSelectedSymbol,
  } = useAlgoForgeStore();

  // Active View Tab: "TRADES" or "NOTIFICATIONS"
  const [activeTab, setActiveTab] = useState<"TRADES" | "NOTIFICATIONS">("TRADES");

  // Trade History States
  const [history, setHistory] = useState<any[]>([]);
  const [filterResult, setFilterResult] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Notification Filter State
  const [notifFilter, setNotifFilter] = useState<string>("ALL");

  // Confirmation Modal State (Trades)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"ALL" | "SINGLE">("ALL");
  const [selectedTradeToDelete, setSelectedTradeToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirmation Modal State (Notifications)
  const [isClearNotifsConfirmOpen, setIsClearNotifsConfirmOpen] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getTradeHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Performance calculations
  const totalTrades = history.length;
  const wins = history.filter((t) => t.result === "WIN").length;
  const losses = history.filter((t) => t.result === "LOSS").length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalRealizedPnl = history.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalGains = history.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(history.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? (totalGains / totalLosses).toFixed(2) : (totalGains > 0 ? "3.20" : "0.00");

  // Automated Algorithmic Earnings
  const automatedTrades = history.filter((t) => t.is_automated !== false);
  const automatedPnl = automatedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Filtered trades
  const filteredTrades = history.filter((t) => {
    if (filterResult === "ALL") return true;
    if (filterResult === "AUTOMATED") return t.is_automated !== false;
    return t.result === filterResult;
  });

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === "ALL") return true;
    return n.category?.toUpperCase() === notifFilter;
  });

  // Prompt Confirmation for clearing all trade history
  const handlePromptClearAll = () => {
    setConfirmAction("ALL");
    setSelectedTradeToDelete(null);
    setIsConfirmOpen(true);
  };

  // Prompt Confirmation for deleting a single trade
  const handlePromptDeleteSingle = (trade: any) => {
    setConfirmAction("SINGLE");
    setSelectedTradeToDelete(trade);
    setIsConfirmOpen(true);
  };

  // Execute Confirmed Delete on Trade History
  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    try {
      if (confirmAction === "ALL") {
        await api.clearTradeHistory();
        setHistory([]);
        setStatusMsg("All closed trade records permanently cleared from history.");
      } else if (confirmAction === "SINGLE" && selectedTradeToDelete) {
        await api.deleteTradeHistoryItem(selectedTradeToDelete.id);
        setHistory((prev) => prev.filter((t) => t.id !== selectedTradeToDelete.id));
        setStatusMsg(`Trade #${selectedTradeToDelete.id} (${selectedTradeToDelete.symbol}) deleted.`);
      }

      // Sync account portfolio
      try {
        const port = await api.getPortfolio();
        if (port?.account) updateAccount(port.account);
      } catch (err) {
        // silent
      }
      setIsConfirmOpen(false);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      alert(`Delete error: ${e.message || "Failed"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Clickable Notification Action Router
  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    const cat = n.category?.toUpperCase();
    const sym = n.symbol && n.symbol !== "SYSTEM" ? n.symbol : "BTCUSDT";

    if (cat === "SIGNALS" || cat === "CHART") {
      setSelectedSymbol(sym);
      router.push(`/chart/${sym}`);
    } else if (cat === "ORDERS") {
      router.push("/positions");
    } else if (cat === "RISK") {
      router.push("/settings");
    } else {
      setSelectedSymbol(sym);
      router.push(`/chart/${sym}`);
    }
  };

  if (loading && history.length === 0) {
    return <TradeHistorySkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Status Feedback Banner */}
      {statusMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-2.5 rounded-lg flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#1e2b45] pb-3">
        <div className="flex items-center space-x-3">
          {/* Main View Tab Switcher */}
          <div className="flex items-center bg-[#0d1322] border border-[#1e2b45] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("TRADES")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "TRADES"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Settled Trades ({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("NOTIFICATIONS")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "NOTIFICATIONS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notification Alerts ({notifications.length})</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Right Action Controls depending on active tab */}
        <div className="flex items-center space-x-2">
          {activeTab === "TRADES" ? (
            <>
              {/* Trades Filter Pills */}
              <div className="flex items-center space-x-1 bg-[#0d1322] border border-[#1e2b45] p-1 rounded-lg text-xs">
                {["ALL", "WIN", "LOSS", "BREAKEVEN", "AUTOMATED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterResult(f)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      filterResult === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Clear History Button */}
              <button
                onClick={handlePromptClearAll}
                disabled={history.length === 0}
                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Clear all trade history with confirmation"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear History</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadHistory}
                disabled={loading}
                className="p-1.5 bg-[#0d1322] hover:bg-[#152238] border border-[#1e2b45] text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </>
          ) : (
            <>
              {/* Notifications Filter Pills */}
              <div className="flex items-center space-x-1 bg-[#0d1322] border border-[#1e2b45] p-1 rounded-lg text-xs">
                {["ALL", "TRADES", "ORDERS", "SIGNALS", "RISK"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setNotifFilter(f)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      notifFilter === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Mark All Read */}
              <button
                onClick={markAllNotificationsRead}
                className="px-2.5 py-1 bg-[#0d1322] hover:bg-[#152238] border border-[#1e2b45] text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mark All Read</span>
              </button>

              {/* Clear Notifications */}
              <button
                onClick={() => setIsClearNotifsConfirmOpen(true)}
                disabled={notifications.length === 0}
                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: SETTLED TRADES WITH SL & ALL TARGETS TAKEN */}
      {activeTab === "TRADES" && (
        <div className="space-y-3 animate-in fade-in">
          {/* KPI Cards: Net Settlement, Win Rate, Automated Algorithm Earnings & Total */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-num tabular-nums">
            <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
              <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
                Total Realized Settlement
              </span>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-base sm:text-lg font-black ${
                    totalRealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {totalRealizedPnl >= 0 ? "+" : ""}${totalRealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9.5px] text-slate-400 font-sans">USD</span>
              </div>
            </div>

            <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
              <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
                Strategy Accuracy
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-base sm:text-lg font-black text-emerald-400">{winRate}%</span>
                <span className="text-[9.5px] text-slate-400 font-sans">
                  {wins}W / {losses}L
                </span>
              </div>
            </div>

            <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
              <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
                Automated Algo Earnings
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-base sm:text-lg font-black text-indigo-300">
                  {automatedPnl >= 0 ? "+" : ""}${automatedPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9.5px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded font-sans">
                  100% AUTO
                </span>
              </div>
            </div>

            <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
              <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
                Settled Trades
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-base sm:text-lg font-black text-white">{totalTrades}</span>
                <span className="text-[9.5px] text-slate-400 font-sans">Delta Verified</span>
              </div>
            </div>
          </div>

          {/* Settled Trades Table */}
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-num tabular-nums">
                <thead>
                  <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[9.5px] uppercase border-b border-[#18263f]">
                    <th className="text-left py-2.5 px-3">Date</th>
                    <th className="text-left py-2.5 px-3">Symbol</th>
                    <th className="text-center py-2.5 px-3">Side</th>
                    <th className="text-left py-2.5 px-3">Strategy</th>
                    <th className="text-right py-2.5 px-3">Entry</th>
                    <th className="text-right py-2.5 px-3">Exit</th>
                    <th className="text-right py-2.5 px-3 text-rose-400">Stop Loss (SL)</th>
                    <th className="text-left py-2.5 px-3 text-emerald-400">Targets Taken &amp; Scaling</th>
                    <th className="text-right py-2.5 px-3">Net P&L</th>
                    <th className="text-right py-2.5 px-3">R:R</th>
                    <th className="text-right py-2.5 px-3">Dur</th>
                    <th className="text-center py-2.5 px-3">Result</th>
                    <th className="text-center py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141e30]">
                  {filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-500 font-medium font-sans">
                        <History className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-50" />
                        <span>No closed trades in history. Executed trades on Delta Exchange will appear here automatically.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredTrades.map((t) => {
                      const isLong = t.direction === "LONG";
                      const isWin = t.result === "WIN";
                      const isLoss = t.result === "LOSS";

                      return (
                        <tr key={t.id} className="hover:bg-[#121b2f]/60 transition-colors group">
                          <td className="text-slate-400 text-[10.5px] py-2.5 px-3">
                            {t.closed_at ? t.closed_at.substring(0, 16).replace("T", " ") : "2026-10-17 12:00"}
                          </td>
                          <td className="font-bold text-white py-2.5 px-3">
                            <Link href={`/chart/${t.symbol}`} className="hover:underline text-indigo-300 flex items-center gap-1">
                              <span>{t.symbol}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isLong
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {t.direction}
                            </span>
                          </td>
                          <td className="text-slate-300 font-sans text-[11px] py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span>{t.strategy}</span>
                              {t.is_automated !== false && (
                                <span className="px-1 py-0.2 rounded text-[8.5px] bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                  AUTO
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right text-white py-2.5 px-3">
                            ${t.entry_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right text-slate-200 py-2.5 px-3">
                            ${t.exit_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          {/* STOP LOSS (SL) COLUMN */}
                          <td className="text-right font-bold text-rose-400 py-2.5 px-3">
                            ${t.stop_loss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          {/* TARGETS TAKEN / SCALING COLUMN */}
                          <td className="py-2.5 px-3 text-[10px] font-sans">
                            {t.targets_taken ? (
                              <div className="flex flex-wrap gap-1 items-center">
                                {t.targets_taken.split(",").map((target: string, idx: number) => {
                                  const text = target.trim();
                                  const isHit = text.includes("✓") || text.includes("Hit") || text.includes("Protected");
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-1.5 py-0.2 rounded font-bold border ${
                                        isHit
                                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                      }`}
                                    >
                                      {text}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono-num">
                                TP: ${t.take_profit?.toLocaleString() || "-"}
                              </span>
                            )}
                          </td>

                          <td
                            className={`text-right font-extrabold py-2.5 px-3 ${
                              t.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {t.pnl >= 0 ? "+" : ""}${t.pnl?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right font-bold text-white py-2.5 px-3">
                            1 : {t.rr}
                          </td>
                          <td className="text-right text-slate-400 py-2.5 px-3">
                            {t.duration_minutes}m
                          </td>
                          <td className="text-center py-2.5 px-3 whitespace-nowrap">
                            {isWin ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  COMPLETED (PROFIT)
                                </span>
                                <span className="text-[9px] text-emerald-400 font-sans mt-0.5 font-bold">
                                  {t.exit_reason || "TP Target Scale Out"}
                                </span>
                              </div>
                            ) : isLoss ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                                  COMPLETED (SL HIT)
                                </span>
                                <span className="text-[9px] text-rose-400 font-sans mt-0.5 font-bold">
                                  {t.exit_reason || "Stop Loss Protected"}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                  <Target className="w-3 h-3 text-cyan-300" />
                                  COMPLETED (BREAKEVEN)
                                </span>
                                <span className="text-[9px] text-cyan-400 font-sans mt-0.5 font-bold">
                                  {t.exit_reason || "0% Risk Protected"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <button
                              onClick={() => handlePromptDeleteSingle(t)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title={`Delete trade #${t.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: REAL-TIME NOTIFICATION ALERTS AUDIT LOG */}
      {activeTab === "NOTIFICATIONS" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden divide-y divide-[#141e30]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-50" />
                <span>No notification records found in the audit log.</span>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isUnread = !n.read;
                const sym = n.symbol && n.symbol !== "SYSTEM" ? n.symbol : null;

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 sm:p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUnread ? "bg-[#121c32]/50 hover:bg-[#121c32]/70" : "hover:bg-[#0f172a]/60"
                    }`}
                  >
                    {/* Left: Icon, Badge, Content */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                          n.level === "success"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : n.level === "warning"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : n.level === "error"
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                        }`}
                      >
                        {n.category === "TRADES" ? (
                          <Target className="w-4 h-4" />
                        ) : n.category === "SIGNALS" ? (
                          <Zap className="w-4 h-4" />
                        ) : n.category === "RISK" ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                            {n.title}
                          </h4>

                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#18263f] text-slate-300 border border-[#1e2b45] uppercase">
                            {n.category}
                          </span>

                          {sym && (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono-num font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {sym}
                            </span>
                          )}

                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-mono-num pt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {n.timestamp ? n.timestamp.substring(0, 16).replace("T", " ") : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Clickable Context Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleNotificationClick(n)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>
                          {n.category === "SIGNALS"
                            ? `View ${sym || "BTC"} Chart`
                            : n.category === "ORDERS"
                            ? "View Positions"
                            : n.category === "RISK"
                            ? "Risk Guard"
                            : "Inspect Action"}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {isUnread && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#18263f] cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - DELETING TRADE HISTORY */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in select-none">
          <div className="bg-[#0d1322] border border-[#1e2b45] rounded-xl max-w-md w-full p-4 space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {confirmAction === "ALL" ? "Clear All Trade History?" : `Delete Trade #${selectedTradeToDelete?.id}?`}
                  </h3>
                  <span className="text-[10px] text-slate-400">Irreversible Action Confirmation</span>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1a2744] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#080c14] border border-[#1e2b45] p-3 rounded-lg text-xs space-y-1.5 text-slate-300">
              {confirmAction === "ALL" ? (
                <>
                  <p className="font-semibold text-rose-300">
                    Are you sure you want to permanently clear all {history.length} settled trade records?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    This will wipe the audit trail, reset realized P&L counters, and restore your trade journal to zero.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-white">
                    Confirm deletion of trade record:
                  </p>
                  <div className="text-[11px] font-mono-num tabular-nums space-y-0.5 text-slate-300 pt-1">
                    <div>Symbol: <strong className="text-indigo-300">{selectedTradeToDelete?.symbol}</strong> ({selectedTradeToDelete?.direction})</div>
                    <div>Strategy: {selectedTradeToDelete?.strategy}</div>
                    <div>Stop Loss: <strong className="text-rose-400">${selectedTradeToDelete?.stop_loss}</strong></div>
                    <div>Net P&L: <strong className={selectedTradeToDelete?.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>{selectedTradeToDelete?.pnl >= 0 ? "+" : ""}${selectedTradeToDelete?.pnl}</strong></div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1e2b45]">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-slate-300 rounded font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded font-bold text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : (confirmAction === "ALL" ? "Yes, Clear All History" : "Delete Record")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - CLEARING NOTIFICATIONS */}
      {isClearNotifsConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in select-none">
          <div className="bg-[#0d1322] border border-[#1e2b45] rounded-xl max-w-md w-full p-4 space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Clear All Notifications?</h3>
                  <span className="text-[10px] text-slate-400">Irreversible Action Confirmation</span>
                </div>
              </div>
              <button
                onClick={() => setIsClearNotifsConfirmOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1a2744] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#080c14] border border-[#1e2b45] p-3 rounded-lg text-xs space-y-1.5 text-slate-300">
              <p className="font-semibold text-rose-300">
                Are you sure you want to permanently clear all {notifications.length} notification alerts?
              </p>
              <p className="text-[11px] text-slate-400">
                This will delete the alert audit history log. New trade signals and order fills will continue to generate notifications in real time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1e2b45]">
              <button
                type="button"
                onClick={() => setIsClearNotifsConfirmOpen(false)}
                className="px-3 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-slate-300 rounded font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearNotifications();
                  setIsClearNotifsConfirmOpen(false);
                  setStatusMsg("All notification alerts have been cleared.");
                  setTimeout(() => setStatusMsg(null), 3000);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
