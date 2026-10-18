"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ShieldAlert,
  X,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");

  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setSelectedSymbol,
    setIsTradePlannerOpen,
  } = useAlgoForgeStore();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(
    (n) => filter === "ALL" || n.category.toUpperCase() === filter
  );

  // Determine destination and action label based on category and symbol
  const getNotificationAction = (n: any) => {
    const cat = n.category?.toUpperCase();
    const sym = n.symbol && n.symbol !== "SYSTEM" ? n.symbol : "BTCUSDT";

    if (cat === "SIGNALS") {
      return {
        label: `View ${sym} Chart`,
        href: `/chart/${sym}`,
        handler: () => {
          setSelectedSymbol(sym);
          router.push(`/chart/${sym}`);
          markNotificationRead(n.id);
          onClose();
        },
      };
    }
    if (cat === "ORDERS") {
      return {
        label: "Open Positions",
        href: "/positions",
        handler: () => {
          router.push("/positions");
          markNotificationRead(n.id);
          onClose();
        },
      };
    }
    if (cat === "TRADES" || n.title?.toLowerCase().includes("settled") || n.title?.toLowerCase().includes("profit")) {
      return {
        label: "Trade History",
        href: "/trade-history",
        handler: () => {
          router.push("/trade-history");
          markNotificationRead(n.id);
          onClose();
        },
      };
    }
    if (cat === "RISK") {
      return {
        label: "Liquidation Heatmap",
        href: "/crypto-intelligence",
        handler: () => {
          router.push("/crypto-intelligence");
          markNotificationRead(n.id);
          onClose();
        },
      };
    }

    // Default system fallback
    return {
      label: "Portfolio",
      href: "/portfolio",
      handler: () => {
        router.push("/portfolio");
        markNotificationRead(n.id);
        onClose();
      },
    };
  };

  return (
    <div className="absolute top-10 right-0 w-80 sm:w-96 bg-[#090d18]/98 backdrop-blur-2xl border border-[#16233a] rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[520px] transition-all animate-in fade-in slide-in-from-top-1 text-slate-200 font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#141f33] bg-[#0c1322] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono-num font-bold bg-indigo-500 text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => markAllNotificationsRead()}
            className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-[#152238] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => clearNotifications()}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-[#152238] transition-colors text-xs cursor-pointer"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#152238] transition-colors text-xs cursor-pointer ml-1"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-2.5 py-1.5 bg-[#080c14] border-b border-[#141f33] flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {["ALL", "SIGNALS", "ORDERS", "RISK", "SYSTEM"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider font-sans uppercase transition-all cursor-pointer ${
              filter === cat
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#121c2f]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto divide-y divide-[#101828] flex-1 max-h-80">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 text-center text-slate-500 flex flex-col items-center justify-center space-y-1.5">
            <Bell className="w-6 h-6 text-slate-600 opacity-40" />
            <p className="text-xs">No notifications in {filter.toLowerCase()}</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isSignal = n.category === "SIGNALS";
            const isOrder = n.category === "ORDERS";
            const isRisk = n.category === "RISK";
            const action = getNotificationAction(n);

            return (
              <div
                key={n.id}
                onClick={action.handler}
                className={`p-3 text-left transition-all cursor-pointer group flex items-start space-x-2.5 hover:bg-[#0f1b33] ${
                  n.read
                    ? "bg-transparent opacity-65 hover:opacity-100"
                    : "bg-[#0b1426] border-l-2 border-indigo-500"
                }`}
              >
                {/* Level / Category Icon */}
                <div className="mt-0.5 shrink-0">
                  {isSignal && (
                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                  )}
                  {isOrder && (
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Zap className="w-3 h-3" />
                    </div>
                  )}
                  {isRisk && (
                    <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" />
                    </div>
                  )}
                  {!isSignal && !isOrder && !isRisk && (
                    <div className="w-5 h-5 rounded bg-slate-500/20 text-slate-400 flex items-center justify-center border border-slate-500/30">
                      <Info className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold text-white truncate font-sans group-hover:text-indigo-300 transition-colors">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 ml-1.5" />
                    )}
                  </div>

                  <p className="text-[10px] text-slate-300 leading-tight mb-1.5 font-sans line-clamp-2">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-mono-num tabular-nums">
                      {n.symbol && n.symbol !== "SYSTEM" && (
                        <span className="text-indigo-400 font-bold">{n.symbol}</span>
                      )}
                      <span>&bull;</span>
                      <span>
                        {new Date(n.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Interactive Clickable Action Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        action.handler();
                      }}
                      className="px-1.5 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[9.5px] font-bold flex items-center gap-0.5 transition-all shadow-sm"
                    >
                      <span>{action.label}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
