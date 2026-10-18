"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import { wsClient } from "@/lib/websocket";
import { api } from "@/lib/api";
import {
  Flame,
  Search,
  SlidersHorizontal,
  Coins,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
  Fuel,
  Bell,
  Zap,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ProfileModal } from "@/components/profile/ProfileModal";

export const TopBar: React.FC = () => {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    activeMarket,
    setActiveMarket,
    selectedSymbol,
    setSelectedSymbol,
    wsConnected,
    account,
    updateAccount,
    liveQuotes,
    searchQuery,
    setSearchQuery,
    setIsTradePlannerOpen,
    isTradePlannerOpen,
    setIsAiChatOpen,
    isAiChatOpen,
    unreadNotificationCount,
    user,
    logout,
    autoTraderEnabled,
  } = useAlgoForgeStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHeaderFullscreen, setIsHeaderFullscreen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    wsClient.connect();

    // Auto-sync portfolio balance and PnL with backend engine
    const syncPortfolio = async () => {
      try {
        const port = await api.getPortfolio();
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
      } catch (err) {
        // silent
      }
    };
    syncPortfolio();
    const syncTimer = setInterval(syncPortfolio, 4000);

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleFsChange = () => {
      const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsHeaderFullscreen(fs);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);

    return () => {
      clearInterval(syncTimer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const toggleWorkstationFullscreen = useCallback(() => {
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => setIsHeaderFullscreen(true));
      } else if ((docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      }
      setIsHeaderFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setIsHeaderFullscreen(false));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsHeaderFullscreen(false);
    }
  }, []);

  // TRADABLE ASSETS: CRYPTO & COMMODITIES ONLY (Zero Fiat Forex)
  const tradableAssets = [
    { symbol: "BTCUSDT", name: "Bitcoin / Tether", market: "CRYPTO", basePrice: 81920.0, icon: "₿" },
    { symbol: "ETHUSDT", name: "Ethereum / Tether", market: "CRYPTO", basePrice: 2425.0, icon: "Ξ" },
    { symbol: "SOLUSDT", name: "Solana / Tether", market: "CRYPTO", basePrice: 104.5, icon: "◎" },
    { symbol: "BNBUSDT", name: "BNB / Tether", market: "CRYPTO", basePrice: 680.0, icon: "🪙" },
    { symbol: "XRPUSDT", name: "XRP / Tether", market: "CRYPTO", basePrice: 1.84, icon: "✕" },
    { symbol: "DOGEUSDT", name: "Dogecoin / Tether", market: "CRYPTO", basePrice: 0.38, icon: "Ð" },
    { symbol: "ADAUSDT", name: "Cardano / Tether", market: "CRYPTO", basePrice: 0.88, icon: "₳" },
    { symbol: "AVAXUSDT", name: "Avalanche / Tether", market: "CRYPTO", basePrice: 42.5, icon: "▲" },
    { symbol: "XAUUSD", name: "Gold Spot ($/oz)", market: "COMMODITIES", basePrice: 4180.35, icon: "🏆" },
    { symbol: "XAGUSD", name: "Silver Spot ($/oz)", market: "COMMODITIES", basePrice: 31.85, icon: "🥈" },
    { symbol: "USOIL", name: "Crude Oil WTI ($/bbl)", market: "COMMODITIES", basePrice: 99.02, icon: "🛢️" },
  ];

  const filteredAssets = tradableAssets.filter(
    (s) =>
      (activeMarket === "ALL" || s.market === activeMarket) &&
      (s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="h-12 border-b border-[#141f33] bg-[#070b14]/95 backdrop-blur-xl px-3 flex items-center justify-between z-50 sticky top-0 select-none w-full max-w-full overflow-visible">
      {/* Left Wing: Logo Brand & Enhanced Quick Symbol Search */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Brand Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 group transition-transform active:scale-98 shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-400/30 group-hover:scale-105 transition-all">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-[13px] tracking-tight text-white font-sans">
              AlgoForge
            </span>
            <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-300 text-[8.5px] font-bold rounded border border-indigo-500/30 uppercase tracking-wider">
              PRO
            </span>
          </div>
        </Link>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-[#16233a] hidden sm:block" />

        {/* Enhanced Clean Search Bar (Segment button removed as requested) */}
        <div ref={searchRef} className="relative w-44 sm:w-56 md:w-64">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search markets, pairs (⌘K)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-8 pr-10 py-1.5 bg-[#0b1120] border border-[#18253e] hover:border-[#223555] focus:border-indigo-500/70 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none transition-all font-sans"
            />
            <div className="absolute right-2 pointer-events-none hidden sm:flex items-center">
              <kbd className="text-[9px] bg-[#111a2d] text-slate-400 px-1.5 py-0.5 rounded border border-[#1c2c49] font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Search Dropdown Modal */}
          {isSearchOpen && (
            <div className="absolute top-9 left-0 w-80 bg-[#090e1a] border border-[#1b2842] rounded-xl py-2 z-50 backdrop-blur-2xl">
              <div className="px-3 py-1.5 text-[9.5px] uppercase font-bold text-slate-400 border-b border-[#141f33] flex items-center justify-between">
                <span>Tradable Instruments</span>
                <span className="text-[8.5px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Feeds
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#101828]">
                {filteredAssets.map((s) => {
                  const q = liveQuotes[s.symbol];
                  const price = q?.price || s.basePrice;
                  const isCrypto = s.market === "CRYPTO";
                  return (
                    <button
                      key={s.symbol}
                      onClick={() => {
                        setSelectedSymbol(s.symbol);
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        router.push(`/chart/${s.symbol}`);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#121c2e] transition-colors group"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs">{s.icon}</span>
                          <span className="font-bold text-white font-mono-num text-[11px] group-hover:text-indigo-300">
                            {s.symbol}
                          </span>
                          <span
                            className={`text-[8px] px-1 py-0.2 rounded font-semibold ${
                              isCrypto
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {s.market}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-400 font-sans truncate">{s.name}</span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="font-bold text-white font-mono-num text-[11px]">
                          ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {q && (
                          <span
                            className={`text-[9px] font-mono-num font-semibold ${
                              q.change_24h >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {q.change_24h >= 0 ? "+" : ""}
                            {q.change_24h.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Wing: WebSocket, Clean Single-Row Financial Ribbon, Auto-Pilot, Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Live WebSocket Status Dot */}
        <div
          className="flex items-center space-x-1.5 px-2 py-0.5 bg-[#0a0f1d] border border-[#141f33] rounded-md shrink-0"
          title={wsConnected ? "WebSocket Gateway Connected (~12ms latency)" : "Connecting to Gateway..."}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              wsConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="text-[9.5px] text-slate-300 font-extrabold tracking-wider uppercase font-sans hidden sm:inline">
            LIVE
          </span>
          <span className="text-[8.5px] text-indigo-400 font-mono hidden xl:inline">
            12ms
          </span>
        </div>

        {/* SOPHISTICATED CLEAN FINANCIAL RIBBON */}
        <div className="hidden md:flex items-center space-x-2.5 px-2.5 py-0.5 bg-[#0a0f1d] border border-[#141f33] rounded-lg shrink-0 text-xs">
          {/* Balance */}
          <div className="flex items-baseline space-x-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">
              BAL
            </span>
            <span className="font-bold text-white font-mono-num tabular-nums text-[11px]">
              ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-3 w-px bg-[#18263f]" />

          {/* Equity */}
          <div className="flex items-baseline space-x-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">
              EQ
            </span>
            <span className="font-bold text-emerald-400 font-mono-num tabular-nums text-[11px] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-3 w-px bg-[#18263f]" />

          {/* Today's P&L */}
          {(() => {
            const pnlPct = account.balance > 0 ? (account.todaysPnl / account.balance) * 100 : 0;
            const isPos = account.todaysPnl >= 0;
            return (
              <div className="flex items-baseline space-x-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">
                  P&L
                </span>
                <span
                  className={`font-bold font-mono-num tabular-nums text-[11px] ${
                    isPos ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPos ? "+" : ""}${account.todaysPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({isPos ? "+" : ""}{pnlPct.toFixed(1)}%)
                </span>
              </div>
            );
          })()}
        </div>

        {/* Compact Mobile Balance (< md) */}
        <div className="flex md:hidden items-center space-x-1 px-1.5 py-0.5 bg-[#0a0f1d] border border-[#141f33] rounded-md shrink-0">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-bold font-mono-num tabular-nums">
            ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-[#16233a] hidden lg:block shrink-0" />

        {/* AUTO-PILOT COCKPIT MICRO-PILL */}
        <button
          onClick={async () => {
            setIsScanning(true);
            try {
              const res = await api.triggerAutoTraderScan();
              if (res?.account) {
                updateAccount(res.account);
              }
            } catch (e) {
              // silent
            } finally {
              setIsScanning(false);
            }
          }}
          disabled={isScanning}
          className="hidden lg:flex items-center space-x-1.5 px-2 py-0.5 bg-[#0a1122] hover:bg-[#0e172e] border border-indigo-500/25 rounded-md transition-all cursor-pointer shrink-0"
          title="Click to trigger on-demand Algorithmic Scan & Auto-Trade"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoTraderEnabled ? "bg-emerald-400" : "bg-slate-500"}`} />
          <span className="text-[9.5px] font-extrabold text-emerald-400 font-sans tracking-tight flex items-center gap-1">
            <span>AUTO $100</span>
            {isScanning && <span className="animate-spin text-[8px]">⚡</span>}
          </span>
        </button>

        {/* NOTIFICATION BELL */}
        <div ref={notificationRef} className="relative shrink-0">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all border flex items-center justify-center relative cursor-pointer ${
              isNotificationsOpen
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-[#0a0f1d] hover:bg-[#121c2e] text-slate-300 hover:text-white border-[#141f33]"
            }`}
            title="Notification Center"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[13px] h-[13px] px-0.5 bg-rose-500 text-white font-mono-num font-extrabold text-[8px] rounded-full flex items-center justify-center border border-[#070b14]">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>

          <NotificationCenter
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleWorkstationFullscreen}
          className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all border flex items-center justify-center shrink-0 cursor-pointer ${
            isHeaderFullscreen
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-[#0a0f1d] hover:bg-[#121c2e] text-slate-300 hover:text-white border-[#141f33]"
          }`}
          title={isHeaderFullscreen ? "Exit Fullscreen (Esc)" : "Expand Fullscreen"}
        >
          {isHeaderFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5 text-indigo-200" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* AI Copilot Trigger */}
        <button
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] transition-all border flex items-center gap-1.5 shrink-0 cursor-pointer ${
            isAiChatOpen
              ? "bg-indigo-600 text-white border-indigo-400"
              : "bg-[#0a0f1d] hover:bg-[#121c2e] text-indigo-300 border-indigo-500/25 hover:border-indigo-500/40"
          }`}
          title="AI Quant Copilot"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="font-sans hidden sm:inline">Copilot</span>
        </button>

        {/* Trade Planner Trigger */}
        <button
          onClick={() => setIsTradePlannerOpen(!isTradePlannerOpen)}
          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] transition-all border flex items-center gap-1.5 shrink-0 cursor-pointer ${
            isTradePlannerOpen
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-[#0a0f1d] hover:bg-[#121c2e] text-slate-300 hover:text-white border-[#141f33]"
          }`}
          title="Trade Risk & Level Planner"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="font-sans hidden sm:inline">Planner</span>
        </button>

        {/* USER PROFILE AVATAR & DROPDOWN */}
        <div ref={userMenuRef} className="relative shrink-0">
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center space-x-1 pl-0.5 text-slate-300 hover:text-white transition-colors cursor-pointer group"
            title="User Profile & Settings"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-indigo-400/25 group-hover:scale-105 transition-transform">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AF"}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-9 right-0 w-64 bg-[#090d18] border border-[#16233a] rounded-xl py-2 z-[100] text-slate-200">
              <div className="px-3.5 py-2 border-b border-[#141f33]">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "AF"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate font-sans">
                      {user?.name || "Algo Trader"}
                    </p>
                    <p className="text-[9.5px] text-indigo-400 font-mono truncate">
                      {user?.email || "trader@algoforge.io"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[9.5px] bg-[#0c1322] px-2 py-1 rounded-md border border-[#16233a]">
                  <span className="text-slate-400 font-semibold">Active Capital</span>
                  <span className="font-bold text-emerald-400 font-mono-num tabular-nums">
                    ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full mt-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3 h-3" />
                  <span>View Institutional Profile</span>
                </button>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#121c2e] flex items-center space-x-2 transition-colors font-sans"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terminal Settings</span>
                </Link>
                <Link
                  href="/live-trading"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#121c2e] flex items-center space-x-2 transition-colors font-sans"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Delta Exchange Bridge</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#121c2e] flex items-center space-x-2 transition-colors font-sans"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In as Another Trader</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#121c2e] flex items-center space-x-2 transition-colors font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create Account</span>
                </Link>
              </div>

              <div className="border-t border-[#141f33] pt-1 px-1">
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center space-x-2 transition-colors font-sans font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Workstation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
