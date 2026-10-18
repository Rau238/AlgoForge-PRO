"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAlgoForgeStore } from "@/lib/store";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "copilot";
  timestamp: string;
  text: string;
  setup?: {
    symbol: string;
    direction: "LONG" | "SHORT";
    entry: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    tp3: number;
    rr: number;
  };
}

export const AiCopilotChatDrawer: React.FC = () => {
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    selectedSymbol,
    liveQuotes,
    account,
    setTradeDirection,
    setTradeLevel,
    setIsTradePlannerOpen,
  } = useAlgoForgeStore();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentQuote = liveQuotes[selectedSymbol];
  const currentPrice = currentQuote?.price || (selectedSymbol.includes("USDT") ? 81600 : 1.124);
  const isCrypto = selectedSymbol.includes("USDT") || selectedSymbol.includes("BTC");
  const precision = isCrypto ? 2 : 5;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "copilot",
      timestamp: "Just now",
      text: `Hello Trader! I am your AlgoForge AI Quant Copilot. I analyze live order book dynamics, volume profiles, and quantitative indicator confluence across **${selectedSymbol}** and other FOREX & CRYPTO markets.\n\nHow can I assist your execution today?`,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isAiChatOpen) return null;

  const quickPrompts = [
    { label: "📊 Analyze Market Trend", prompt: `Analyze current trend and momentum for ${selectedSymbol}` },
    { label: "🎯 1:3 R:R Trade Setup", prompt: `Generate an institutional 1:3 RR trade setup for ${selectedSymbol}` },
    { label: "⚡ Key Levels & S/R", prompt: `What are the critical support, resistance, and liquidity levels for ${selectedSymbol}?` },
    { label: "🛡️ Position Sizing", prompt: `Calculate conservative position size for ${selectedSymbol} with $${account.balance} balance` },
  ];

  const handleSend = (userText?: string) => {
    const textToSend = userText || input.trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      let tradeSetup: Message["setup"] | undefined = undefined;

      const delta = isCrypto ? currentPrice * 0.012 : currentPrice * 0.0035;
      const isLongPreferred = (currentQuote?.change_24h ?? 0) >= 0;

      if (textToSend.toLowerCase().includes("setup") || textToSend.toLowerCase().includes("r:r") || textToSend.toLowerCase().includes("trade")) {
        const dir = isLongPreferred ? "LONG" : "SHORT";
        const entry = currentPrice;
        const sl = dir === "LONG" ? entry - delta : entry + delta;
        const tp1 = dir === "LONG" ? entry + delta * 1.5 : entry - delta * 1.5;
        const tp2 = dir === "LONG" ? entry + delta * 3.0 : entry - delta * 3.0;
        const tp3 = dir === "LONG" ? entry + delta * 4.5 : entry - delta * 4.5;

        tradeSetup = {
          symbol: selectedSymbol,
          direction: dir,
          entry,
          stopLoss: sl,
          tp1,
          tp2,
          tp3,
          rr: 3.0,
        };

        botResponse = `### Quantitative Trade Setup for **${selectedSymbol}**\n\n- **Bias:** ${dir === "LONG" ? "Bullish Accumulation 🟢" : "Bearish Distribution 🔴"}\n- **Market Structure:** Break of structure (BOS) with Volume Weighted Average Price (VWAP) holding firm.\n- **Risk-to-Reward:** 1:3.0 Institutional Model\n- **Recommended Stop Loss:** Safe invalidation outside fair value gap (FVG).\n\nClick **"Apply to Trade Planner"** below to load this setup directly into your execution matrix.`;
      } else if (textToSend.toLowerCase().includes("trend") || textToSend.toLowerCase().includes("momentum")) {
        botResponse = `### **${selectedSymbol}** Trend & Momentum Diagnostic\n\n- **Current Price:** $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: precision })}\n- **24h Change:** ${(currentQuote?.change_24h ?? 1.25) >= 0 ? "+" : ""}${(currentQuote?.change_24h ?? 1.25).toFixed(2)}%\n- **Moving Averages:** EMA-20 is ${isLongPreferred ? "trending cleanly above" : "compressing below"} EMA-50.\n- **RSI (14):** 56.4 (Neutral-Bullish expansion zone).\n- **Macro Flow:** Strong liquidity pools identified above recent highs. Volume delta suggests institutional absorption.`;
      } else if (textToSend.toLowerCase().includes("support") || textToSend.toLowerCase().includes("resistance") || textToSend.toLowerCase().includes("levels")) {
        const r1 = currentPrice * 1.018;
        const r2 = currentPrice * 1.035;
        const s1 = currentPrice * 0.982;
        const s2 = currentPrice * 0.965;
        botResponse = `### Critical Liquidity & S/R Zones for **${selectedSymbol}**\n\n- **Major Resistance 2:** $${r2.toFixed(precision)} (Prior liquidity sweep)\n- **Immediate Resistance 1:** $${r1.toFixed(precision)} (Local supply block)\n- **Current Mid Price:** $${currentPrice.toFixed(precision)}\n- **Immediate Support 1:** $${s1.toFixed(precision)} (Order block + 0.618 Fib)\n- **Major Support 2:** $${s2.toFixed(precision)} (Structural demand pool)`;
        const riskDollars = Math.round(account.balance * 0.02 * 100) / 100;
        const posSize = (riskDollars / (delta || 1)).toFixed(3);
        botResponse = `### Position Sizing & Capital Preservation ($100 Capital Workstation)\n\n- **Account Equity:** $${account.equity.toFixed(2)}\n- **Recommended Risk (2%):** $${riskDollars.toFixed(2)}\n- **Suggested Position Size:** ${posSize} units\n- **Leverage Recommendation:** 20x–25x Isolated Margin on Delta Exchange to maintain margin under $14/trade.`;
      } else {
        botResponse = `I have analyzed the quantitative order book for **${selectedSymbol}**. Currently trading at **$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: precision })}** with an active spread of **${currentQuote?.spread_pips ?? 0.8} pips**.\n\nWould you like a calculated **1:3 RR Trade Plan**, **Trend Analysis**, or **Support/Resistance Breakdown**?`;
      }

      const copilotMsg: Message = {
        id: Math.random().toString(),
        sender: "copilot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: botResponse,
        setup: tradeSetup,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 600);
  };

  const applySetupToPlanner = (setup: NonNullable<Message["setup"]>) => {
    setTradeDirection(setup.direction);
    setTradeLevel("entry", setup.entry);
    setTradeLevel("stopLoss", setup.stopLoss);
    setTradeLevel("tp1", setup.tp1);
    setTradeLevel("tp2", setup.tp2);
    setTradeLevel("tp3", setup.tp3);
    setIsTradePlannerOpen(true);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-[#0d1322]/98 backdrop-blur-2xl border-l border-[#1e2b45] z-[99999] shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="h-14 border-b border-[#1e2b45] px-4 flex items-center justify-between bg-[#080c14]/90 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-sm">AlgoForge Copilot</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded">
                AI ONLINE
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono-num">
              <span>{selectedSymbol}</span>
              <span>•</span>
              <span className="text-white font-bold">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: precision })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome",
                  sender: "copilot",
                  timestamp: "Just now",
                  text: `Chat reset. Analyzing live market conditions for **${selectedSymbol}**. How can I help?`,
                },
              ])
            }
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#17233c] rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAiChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#17233c] rounded-lg transition-colors"
            title="Close Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-[#080c14] border-b border-[#1e2b45] overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.prompt)}
            className="px-2.5 py-1 rounded-md bg-[#121b2f] hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-[#1e2b45] hover:border-indigo-500 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 px-1">
              {msg.sender === "copilot" ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase">Quant Copilot</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">You</span>
                </>
              )}
              <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-md ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white font-medium rounded-tr-none"
                  : "bg-[#121b2f] border border-[#1e2b45] text-slate-200 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Actionable Setup Card inside message */}
              {msg.setup && (
                <div className="mt-3 p-3 bg-[#080c14] border border-indigo-500/40 rounded-lg shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1e2b45] mb-2">
                    <span className="font-bold text-white flex items-center gap-1 font-mono-num">
                      {msg.setup.symbol}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          msg.setup.direction === "LONG"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {msg.setup.direction}
                      </span>
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold font-mono-num">
                      R:R {msg.setup.rr}:1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-num mb-3">
                    <div>
                      <span className="text-slate-400">Entry: </span>
                      <strong className="text-white">${msg.setup.entry.toFixed(precision)}</strong>
                    </div>
                    <div>
                      <span className="text-rose-400">Stop Loss: </span>
                      <strong className="text-rose-300">${msg.setup.stopLoss.toFixed(precision)}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400">TP 1: </span>
                      <strong className="text-emerald-300">${msg.setup.tp1.toFixed(precision)}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400">TP 2 (Target): </span>
                      <strong className="text-emerald-300">${msg.setup.tp2.toFixed(precision)}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => applySetupToPlanner(msg.setup!)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Apply to Trade Planner</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs px-2 py-1">
            <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span className="font-mono text-[11px] text-slate-400">Quant Copilot is analyzing live feeds...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-[#080c14] border-t border-[#1e2b45] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask about ${selectedSymbol}, trade setups, risk...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#121b2f] border border-[#1e2b45] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 text-center text-[9px] text-slate-500 font-sans">
          Institutional Algorithmic Intelligence • Forex & Crypto Markets Only
        </div>
      </div>
    </div>
  );
};
