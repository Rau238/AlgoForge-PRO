"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import { SkeletonBox } from "@/components/common/PageSkeletons";
import {
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  SlidersHorizontal,
  Activity,
  Sparkles,
  Layers,
  Zap,
  Play,
  TrendingUp,
  X,
} from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface Props {
  symbol?: string;
  timeframe?: string;
  isMultiChart?: boolean;
}

export const TradingViewChart: React.FC<Props> = ({
  symbol: propSymbol,
  timeframe: propTimeframe,
  isMultiChart = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetContainerIdRef = useRef<string>(
    `tv_chart_${Math.random().toString(36).substring(2, 9)}`
  );

  const {
    selectedSymbol: storeSymbol,
    timeframe: storeTimeframe,
    setTimeframe: setStoreTimeframe,
    setSelectedSymbol,
    liveQuotes,
    tradeSetup,
    setTradeLevel,
    setTradeDirection,
    setIsTradePlannerOpen,
    isTradePlannerOpen,
    positions: storePositions,
    updateAccount,
  } = useAlgoForgeStore();

  const symbol = (propSymbol || storeSymbol).toUpperCase();
  const timeframe = propTimeframe || storeTimeframe;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const [positions, setPositions] = useState<any[]>([]);
  const [isTestingAlgo, setIsTestingAlgo] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [pendingSide, setPendingSide] = useState<"BUY" | "SELL">("BUY");
  const [isExecutingOrder, setIsExecutingOrder] = useState(false);

  // Load live positions for chart overlay
  const loadPositions = useCallback(async () => {
    try {
      const data = await api.getPositions();
      setPositions(data || []);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 2500);
    return () => clearInterval(interval);
  }, [loadPositions]);

  // Active position for currently viewed chart symbol (prefer real-time store positions)
  const effectivePositions = storePositions && storePositions.length > 0 ? storePositions : positions;
  const activePosition = useMemo(() => {
    return effectivePositions.find(
      (p) => p.symbol === symbol && p.status !== "CLOSED"
    );
  }, [effectivePositions, symbol]);

  // Map symbols to TradingView native tickers
  const tvSymbol = useMemo(() => {
    const sym = symbol.toUpperCase();
    if (sym === "XAUUSD" || sym === "GOLD") return "OANDA:XAUUSD";
    if (sym === "XAGUSD" || sym === "SILVER") return "OANDA:XAGUSD";
    if (sym === "USOIL" || sym === "OIL") return "TVC:USOIL";
    if (
      sym.includes("USDT") ||
      sym.startsWith("BTC") ||
      sym.startsWith("ETH") ||
      sym.startsWith("SOL") ||
      sym.startsWith("BNB") ||
      sym.startsWith("XRP") ||
      sym.startsWith("DOGE") ||
      sym.startsWith("ADA") ||
      sym.startsWith("AVAX") ||
      sym.startsWith("LINK")
    ) {
      return `BINANCE:${sym.includes("USDT") ? sym : sym + "USDT"}`;
    }
    return `BINANCE:${sym}`;
  }, [symbol]);

  // Asset type badge
  const assetBadge = useMemo(() => {
    if (symbol === "XAUUSD" || symbol === "GOLD") return "GOLD SPOT (OZ)";
    if (symbol === "XAGUSD" || symbol === "SILVER") return "SILVER SPOT (OZ)";
    if (symbol === "USOIL" || symbol === "OIL") return "CRUDE OIL WTI";
    return "BINANCE SPOT";
  }, [symbol]);

  // Timeframe interval resolution for TradingView Widget
  const tvInterval = useMemo(() => {
    const map: Record<string, string> = {
      "1m": "1",
      "3m": "3",
      "5m": "5",
      "15m": "15",
      "30m": "30",
      "1H": "60",
      "2H": "120",
      "4H": "240",
      "1D": "D",
      "1W": "W",
    };
    return map[timeframe] || "60";
  }, [timeframe]);

  // Initialize TradingView Widget
  useEffect(() => {
    let isMounted = true;
    const containerId = widgetContainerIdRef.current;

    const initWidget = () => {
      if (!isMounted || !window.TradingView) return;

      try {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = "";

        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#080c14",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId,
          hide_top_toolbar: true, // Eliminates empty gap above candles
          hide_side_toolbar: false,
          withdateranges: true,
          details: false,
          hotlist: false,
          calendar: false,
          studies: ["STD;EMA"],
          disabled_features: ["header_saveload"],
          enabled_features: ["study_templates", "side_toolbar_in_fullscreen_mode"],
          overrides: {
            "paneProperties.background": "#080c14",
            "paneProperties.vertGridProperties.color": "rgba(30, 43, 69, 0.35)",
            "paneProperties.horzGridProperties.color": "rgba(30, 43, 69, 0.35)",
            "scalesProperties.textColor": "#78879e",
            "scalesProperties.lineColor": "#1e2b45",
            "mainSeriesProperties.candleStyle.upColor": "#10b981",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": false,
            "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
          },
        });

        setIsWidgetLoading(false);
      } catch (err) {
        console.error("Error initializing TradingView widget:", err);
        setIsWidgetLoading(false);
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      const existingScript = document.getElementById("tradingview-widget-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "tradingview-widget-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = () => {
          if (isMounted) initWidget();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initWidget);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [tvSymbol, tvInterval]);

  const triggerResizeEvents = useCallback(() => {
    [0, 50, 150, 300, 600].forEach((delay) => {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, delay);
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (!isFullscreen) {
      setIsFullscreen(true);
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
      triggerResizeEvents();
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
      triggerResizeEvents();
    }
  }, [isFullscreen, triggerResizeEvents]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isNativeFs);
      triggerResizeEvents();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
        triggerResizeEvents();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, triggerResizeEvents]);

  // Live price & Real-Time P&L Calculations
  const currentQuote = liveQuotes[symbol];
  const livePrice = currentQuote?.price || activePosition?.current_price || activePosition?.entry_price || 81750;
  const precision = symbol.includes("JPY") ? 2 : (symbol.includes("USDT") ? 2 : 4);
  const change24h = currentQuote?.change_24h || 0;

  // Real-Time P&L for Active Position
  const liveDiff = activePosition ? (
    activePosition.direction === "LONG"
      ? (livePrice - activePosition.entry_price)
      : (activePosition.entry_price - livePrice)
  ) : 0;
  const livePnl = activePosition ? Math.round(liveDiff * activePosition.quantity * 100) / 100 : 0;
  const livePnlPct = activePosition ? Math.round((liveDiff / (activePosition.entry_price || 1)) * 10000) / 100 : 0;

  // Quick Order execution
  const handleQuickOrder = async (side: "BUY" | "SELL") => {
    try {
      const defaultQty = symbol.includes("BTC") ? 0.004 : (symbol.includes("ETH") ? 0.12 : (symbol.includes("SOL") ? 1.5 : (symbol.includes("XAU") ? 0.06 : 1.0)));
      await api.createOrder({
        symbol,
        side,
        order_type: "MARKET",
        quantity: tradeSetup.calculatedPlan?.position_size || defaultQty,
        price: livePrice,
        leverage: 25,
        margin_mode: "ISOLATED",
        stop_loss: tradeSetup.stopLoss,
        tp1: tradeSetup.tp1,
        tp2: tradeSetup.tp2,
        tp3: tradeSetup.tp3,
        tp4: tradeSetup.tp4,
        strategy: "Delta Quantitative Execution",
        rr: tradeSetup.calculatedPlan?.risk_reward_ratio || 3.0,
      });
      setOrderNotification(
        `Order Filled on Delta Exchange: ${side} ${symbol} @ $${livePrice.toLocaleString(undefined, { minimumFractionDigits: precision })}`
      );
      setTimeout(() => setOrderNotification(null), 4000);
      loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Breakeven action on chart
  const handleBreakeven = async (posId: number) => {
    try {
      await api.modifyPosition(posId, { action: "BREAKEVEN" });
      setOrderNotification("Stop Loss moved to Breakeven!");
      setTimeout(() => setOrderNotification(null), 3000);
      loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Close Position on chart
  const handleClosePosition = async (posId: number, partialPct?: number) => {
    try {
      await api.modifyPosition(posId, { action: "CLOSE", partial_pct: partialPct });
      setOrderNotification(
        partialPct ? `Closed ${partialPct}% of position on Delta Exchange!` : "Position Closed at Market!"
      );
      setTimeout(() => setOrderNotification(null), 3000);
      loadPositions();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Test Algo Strategy on Delta Exchange
  const handleRunAlgoTest = async () => {
    setIsTestingAlgo(true);
    try {
      const res = await api.testAlgoCycle(
        symbol,
        "Delta Momentum Breakout",
        25,
        "LONG"
      );
      setOrderNotification(
        `Delta Algo Test Executed! Realized P&L: +$${res.realized_profit} | New Balance: $${res.new_balance.toLocaleString()}`
      );
      setTimeout(() => setOrderNotification(null), 5000);
      loadPositions();
      if (res.account) {
        updateAccount(res.account);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingAlgo(false);
    }
  };

  const displayName = useMemo(() => {
    if (symbol === "XAUUSD" || symbol === "GOLD") return "GOLD (XAU/USD)";
    if (symbol === "XAGUSD" || symbol === "SILVER") return "SILVER (XAG/USD)";
    if (symbol === "USOIL" || symbol === "OIL") return "CRUDE OIL (WTI)";
    return symbol;
  }, [symbol]);

  return (
    <div
      ref={wrapperRef}
      className={`flex flex-col bg-[#080c14] select-none transition-all ${
        isFullscreen
          ? "fixed inset-0 z-[99999] w-screen h-screen rounded-none border-0 m-0 p-0"
          : isMultiChart
          ? "h-full w-full flex-1 min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden shadow-lg"
          : "h-full w-full flex-1 min-h-0 border-0 rounded-none overflow-hidden"
      }`}
    >
      {/* Chart Top Header Toolbar */}
      <div className="h-10 shrink-0 border-b border-[#1e2b45] bg-[#0d1322] px-3 flex items-center justify-between select-none">
        {/* Left: Active Pair & Live Price */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide font-mono-num">
              {displayName}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#121b2f] border border-[#1e2b45] text-cyan-300 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {assetBadge}
            </span>
            <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold font-mono-num">
              DELTA 25x
            </span>
          </div>

          {/* Current Live Ticker Price with color flash */}
          <div className="flex items-baseline space-x-1 font-mono-num">
            <span className="text-xs sm:text-sm font-black text-white">
              ${livePrice.toLocaleString(undefined, { minimumFractionDigits: precision })}
            </span>
            <span
              className={`text-[10px] font-bold ${
                change24h >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Center: Timeframe Switcher */}
        <div className="hidden md:flex items-center bg-[#080c14] border border-[#1e2b45] rounded-lg p-0.5 text-[11px] font-mono-num shrink-0">
          {["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              onClick={() => setStoreTimeframe(tf)}
              className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
                timeframe === tf
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Quick BUY & SELL Execution Buttons - REQUIRES CONFIRMATION */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setPendingSide("BUY");
                setTradeDirection("LONG");
                setIsConfirmingOrder(true);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
              title="Open BUY confirmation modal"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>BUY</span>
            </button>
            <button
              onClick={() => {
                setPendingSide("SELL");
                setTradeDirection("SHORT");
                setIsConfirmingOrder(true);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
              title="Open SELL confirmation modal"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>SELL</span>
            </button>
          </div>

          {/* Run Delta Algo Test Cycle Button */}
          <button
            onClick={handleRunAlgoTest}
            disabled={isTestingAlgo}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 border transition-all shrink-0 ${
              isTestingAlgo
                ? "bg-amber-600/50 text-amber-200 border-amber-500/40 cursor-wait"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-400 shadow-md shadow-amber-600/20 active:scale-95"
            }`}
            title="Execute Automated Delta Exchange Algo Trade Test"
          >
            <Play className={`w-3 h-3 ${isTestingAlgo ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline font-sans text-xs">Test Algo</span>
          </button>

          {/* Trade Planner Drawer Trigger */}
          <button
            onClick={() => setIsTradePlannerOpen(!isTradePlannerOpen)}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border transition-all shrink-0 ${
              isTradePlannerOpen
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                : "bg-[#121b2f] hover:bg-[#17233c] text-indigo-300 border-indigo-500/30"
            }`}
            title="Open Trade Planner"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-sans text-xs">Planner</span>
          </button>

          {/* Fullscreen Expand / Collapse Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 border rounded-md transition-all flex items-center gap-1 shrink-0 ${
              isFullscreen
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold"
                : "bg-[#121b2f] hover:bg-[#17233c] border-[#1e2b45] text-slate-300 hover:text-white"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Chart Fullscreen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] hidden sm:inline">Exit (Esc)</span>
              </>
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main TradingView Real-Time Chart Container */}
      <div className="relative flex-1 min-h-0 w-full h-full overflow-hidden bg-[#080c14]">
        {/* Real-Time TradingView Embed Container */}
        <div
          id={widgetContainerIdRef.current}
          ref={containerRef}
          className="w-full h-full min-h-[300px]"
        />

        {/* 1. FLOATING POSITION & STRATEGY TELEMETRY OVERLAY ON CHART */}
        {activePosition ? (
          <div className="absolute top-2.5 left-3 z-30 max-w-[96%] sm:max-w-none bg-[#0a0f1d]/95 backdrop-blur-md border border-[#1e2b45] rounded-xl px-3 py-2 shadow-2xl flex flex-wrap items-center gap-2.5 text-xs animate-in fade-in duration-200 font-mono-num tabular-nums">
            {/* Strategy Badge */}
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] font-sans">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activePosition.strategy || "Delta Momentum Breakout"}</span>
              <span className="text-[10px] text-cyan-300 font-mono-num font-extrabold px-1 rounded bg-[#080c14] border border-[#1e2b45]">
                {activePosition.leverage || 25}x [{activePosition.margin_mode || "ISOLATED"}]
              </span>
            </div>

            {/* Position Direction & Size */}
            <div className="flex items-center space-x-1 font-bold text-xs">
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-sans font-black ${
                  activePosition.direction === "LONG"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {activePosition.direction} {activePosition.quantity}
              </span>
              <span className="text-slate-300">
                @ ${activePosition.entry_price.toLocaleString(undefined, { minimumFractionDigits: precision })}
              </span>
            </div>

            {/* Stop Loss & TPs Taken Status */}
            <div className="hidden lg:flex items-center gap-2 text-[10.5px] border-l border-[#1e2b45] pl-2 text-slate-300">
              <span className="text-rose-400 font-bold">
                SL: ${activePosition.stop_loss?.toLocaleString() || "-"}
              </span>
              {activePosition.breakeven_moved && (
                <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans font-bold">
                  Breakeven Protected ✓
                </span>
              )}
              {activePosition.tp1_hit && (
                <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-sans font-bold">
                  TP1 Scaled (25%) ✓
                </span>
              )}
            </div>

            {/* Real-Time Live Unrealized P&L */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">P&L:</span>
              <span
                className={`font-black text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                  livePnl >= 0
                    ? "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30"
                    : "text-rose-400 bg-rose-500/20 border border-rose-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${livePnl >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)} ({livePnlPct >= 0 ? "+" : ""}{livePnlPct.toFixed(2)}%)
              </span>
            </div>

            {/* Position Actions Directly on Chart */}
            <div className="flex items-center space-x-1 shrink-0 ml-auto sm:ml-0 font-sans">
              <button
                onClick={() => handleBreakeven(activePosition.id)}
                className="px-2 py-0.5 rounded bg-[#121b2f] hover:bg-[#1a2744] border border-[#1e2b45] text-amber-300 text-[10px] font-bold transition-all"
                title="Move Stop Loss to Entry (Breakeven)"
              >
                Breakeven
              </button>
              <button
                onClick={() => handleClosePosition(activePosition.id, 50)}
                className="px-2 py-0.5 rounded bg-[#121b2f] hover:bg-[#1a2744] border border-[#1e2b45] text-indigo-300 text-[10px] font-bold transition-all"
                title="Close 50% Position"
              >
                Close 50%
              </button>
              <button
                onClick={() => handleClosePosition(activePosition.id)}
                className="px-2 py-0.5 rounded bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold transition-all shadow-sm"
                title="Market Close Entire Position"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Applied Strategy Telemetry Overlay when no open position */
          <div className="absolute top-2.5 left-3 z-30 bg-[#0a0f1d]/90 backdrop-blur-md border border-[#1e2b45] rounded-lg px-2.5 py-1.5 shadow-xl flex items-center gap-2.5 text-[10.5px] font-mono-num tabular-nums">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold font-sans">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Delta Momentum Breakout</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                72.4% Win Rate
              </span>
            </div>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline">
              Auto Earnings: <strong className="text-emerald-400">+$5,840.00</strong> (PF: 2.18)
            </span>
            <span className="text-slate-600 hidden md:inline">&bull;</span>
            <span className="text-slate-400 hidden md:inline">
              Planned SL: <strong className="text-rose-400">${tradeSetup.stopLoss?.toLocaleString() || "-"}</strong> &bull; TP1: <strong className="text-emerald-400">${tradeSetup.tp1?.toLocaleString() || "-"}</strong>
            </span>
          </div>
        )}

        {/* 2. ORDER CONFIRMATION MODAL - NO TRADE EXECUTED UNTIL CONFIRMED */}
        {isConfirmingOrder && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-[#0d1322] border border-[#1e2b45] rounded-xl max-w-md w-full p-4 space-y-3.5 shadow-2xl animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between border-b border-[#1e2b45] pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                      pendingSide === "BUY" ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  >
                    {pendingSide === "BUY" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Confirm {pendingSide} Order on Delta Exchange
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono-num">
                      {symbol} &bull; 25x Isolated Leverage
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsConfirmingOrder(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1a2744]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Parameters & Risk Card */}
              <div className="bg-[#080c14] border border-[#1e2b45] p-3 rounded-lg text-xs space-y-2 font-mono-num tabular-nums">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Order Side & Type:</span>
                  <span className={pendingSide === "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    MARKET {pendingSide}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Market Price:</span>
                  <span className="text-white font-bold">
                    ${livePrice.toLocaleString(undefined, { minimumFractionDigits: precision })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Strategy Model:</span>
                  <span className="text-indigo-300 font-bold font-sans">Delta Momentum Breakout</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Stop Loss (SL):</span>
                  <span className="text-rose-400 font-bold">
                    ${tradeSetup.stopLoss?.toLocaleString() || (pendingSide === "BUY" ? (livePrice * 0.985).toFixed(2) : (livePrice * 1.015).toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Take Profit (TP1):</span>
                  <span className="text-emerald-400 font-bold">
                    ${tradeSetup.tp1?.toLocaleString() || (pendingSide === "BUY" ? (livePrice * 1.015).toFixed(2) : (livePrice * 0.985).toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-[#1e2b45]">
                  <span className="font-sans text-slate-400">Delta Brokerage Fee:</span>
                  <span className="text-slate-300">Taker 0.05% / Maker 0.02%</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span className="font-sans">Tax Compliance:</span>
                  <span>18% GST on Trading Fees</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1e2b45]">
                <button
                  type="button"
                  onClick={() => setIsConfirmingOrder(false)}
                  disabled={isExecutingOrder}
                  className="px-3.5 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-slate-300 rounded font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsExecutingOrder(true);
                    try {
                      await handleQuickOrder(pendingSide);
                      setIsConfirmingOrder(false);
                    } finally {
                      setIsExecutingOrder(false);
                    }
                  }}
                  disabled={isExecutingOrder}
                  className={`px-4 py-1.5 text-white rounded font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
                    pendingSide === "BUY"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                  }`}
                >
                  {isExecutingOrder ? (
                    <span>Submitting to Delta...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Place {pendingSide}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content-Tailored Chart Candlestick Skeleton */}
        {isWidgetLoading && (
          <div className="absolute inset-0 bg-[#080c14] p-3 flex flex-col justify-between z-10 pointer-events-none animate-in fade-in">
            {/* Top Bar Skeleton */}
            <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-5 w-24" />
                <SkeletonBox className="h-4 w-12 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((t) => (
                  <SkeletonBox key={t} className="h-5 w-7 rounded" />
                ))}
              </div>
            </div>

            {/* Simulating Candles and Axis Grids */}
            <div className="flex-1 relative my-2 flex items-end justify-between gap-1 overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between opacity-30 pointer-events-none">
                {[1, 2, 3, 4, 5].map((g) => (
                  <div key={g} className="border-b border-dashed border-[#18263f] w-full" />
                ))}
              </div>
              
              {[
                { h: "45%", up: true },
                { h: "55%", up: true },
                { h: "50%", up: false },
                { h: "62%", up: true },
                { h: "58%", up: false },
                { h: "70%", up: true },
                { h: "65%", up: false },
                { h: "80%", up: true },
                { h: "75%", up: false },
                { h: "85%", up: true },
                { h: "78%", up: false },
                { h: "90%", up: true },
              ].map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className={`w-0.5 ${c.up ? "bg-emerald-500/20" : "bg-rose-500/20"} h-4`} />
                  <SkeletonBox
                    style={{ height: c.h }}
                    className={`w-full max-w-[18px] rounded-xs ${
                      c.up ? "bg-emerald-500/10" : "bg-rose-500/10"
                    }`}
                  />
                  <div className={`w-0.5 ${c.up ? "bg-emerald-500/20" : "bg-rose-500/20"} h-3`} />
                </div>
              ))}

              <div className="w-12 h-full border-l border-[#18263f] flex flex-col justify-between py-2 pl-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <SkeletonBox key={p} className="h-2.5 w-8" />
                ))}
              </div>
            </div>

            {/* Bottom Time Axis Skeleton */}
            <div className="flex items-center justify-between border-t border-[#18263f] pt-1 text-[9px]">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <SkeletonBox key={k} className="h-2.5 w-10" />
              ))}
            </div>
          </div>
        )}

        {/* Order Notification Banner */}
        {orderNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{orderNotification}</span>
          </div>
        )}
      </div>
    </div>
  );
};
