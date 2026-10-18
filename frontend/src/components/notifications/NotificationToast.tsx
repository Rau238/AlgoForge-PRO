"use client";

import React, { useEffect } from "react";
import { useAlgoForgeStore } from "@/lib/store";
import { Bell, CheckCircle2, AlertTriangle, Info, X, ExternalLink, Zap } from "lucide-react";

export const NotificationToast: React.FC = () => {
  const { toastNotification, dismissToast } = useAlgoForgeStore();

  useEffect(() => {
    if (!toastNotification) return;

    // Optional subtle sound chime using Web Audio API
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio autoplay policy fallback
    }

    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);

    return () => clearTimeout(timer);
  }, [toastNotification, dismissToast]);

  if (!toastNotification) return null;

  const isSuccess = toastNotification.level === "success";
  const isWarning = toastNotification.level === "warning";
  const isError = toastNotification.level === "error";

  const borderColor = isSuccess
    ? "border-emerald-500/50 shadow-emerald-500/20"
    : isWarning
    ? "border-amber-500/50 shadow-amber-500/20"
    : isError
    ? "border-rose-500/50 shadow-rose-500/20"
    : "border-indigo-500/50 shadow-indigo-500/20";

  const iconColor = isSuccess
    ? "text-emerald-400 bg-emerald-500/15"
    : isWarning
    ? "text-amber-400 bg-amber-500/15"
    : isError
    ? "text-rose-400 bg-rose-500/15"
    : "text-indigo-400 bg-indigo-500/15";

  return (
    <aside
      aria-label="Real-time notification"
      className={`fixed top-16 right-4 z-50 max-w-sm w-full bg-[#0a0f1d]/95 backdrop-blur-2xl border rounded-xl shadow-2xl p-3.5 transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${borderColor}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-[#131d33] text-indigo-300 border border-[#1e2b45] font-sans">
              {toastNotification.category}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>
          <h4 className="text-xs font-bold text-white tracking-tight truncate font-sans">
            {toastNotification.title}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 font-sans break-words">
            {toastNotification.message}
          </p>

          {/* Clickable Action Button */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                const sym = toastNotification.symbol && toastNotification.symbol !== "SYSTEM" ? toastNotification.symbol : "BTCUSDT";
                const cat = toastNotification.category?.toUpperCase();
                if (cat === "SIGNALS") {
                  window.location.href = `/chart/${sym}`;
                } else if (cat === "ORDERS") {
                  window.location.href = `/positions`;
                } else if (cat === "TRADES") {
                  window.location.href = `/trade-history`;
                } else if (cat === "RISK") {
                  window.location.href = `/crypto-intelligence`;
                } else {
                  window.location.href = `/portfolio`;
                }
                dismissToast();
              }}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-all shadow-sm cursor-pointer"
            >
              <span>
                {toastNotification.category === "SIGNALS"
                  ? `Open ${toastNotification.symbol || "BTC"} Chart`
                  : toastNotification.category === "ORDERS"
                  ? "View Positions"
                  : toastNotification.category === "TRADES"
                  ? "Trade History"
                  : toastNotification.category === "RISK"
                  ? "Liquidation Heatmap"
                  : "View Details"}
              </span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#152238] transition-colors shrink-0"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress countdown indicator */}
      <div className="w-full h-0.5 bg-[#17233c] rounded-full overflow-hidden mt-2.5">
        <div
          className={`h-full ${
            isSuccess ? "bg-emerald-400" : isWarning ? "bg-amber-400" : "bg-indigo-400"
          } animate-out fade-out fill-mode-forwards`}
          style={{ animationDuration: "6000ms" }}
        />
      </div>
    </aside>
  );
};
