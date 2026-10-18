"use client";

import React from "react";
import { DirectionType } from "@/lib/types";
import { ShieldAlert, Target, Award, Sparkles, TrendingUp, Compass } from "lucide-react";

interface Props {
  symbol: string;
  direction: DirectionType;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4?: number;
  riskAmount: number;
  maxReward: number;
  riskReward: string;
  confidence: number;
  strategyName: string;
  timeframe: string;
}

export const TradePlanCard: React.FC<Props> = ({
  symbol,
  direction,
  entry,
  stopLoss,
  tp1,
  tp2,
  tp3,
  tp4,
  riskAmount,
  maxReward,
  riskReward,
  confidence,
  strategyName,
  timeframe,
}) => {
  const isLong = direction === "LONG";

  return (
    <div className="w-full max-w-sm rounded-xl bg-gradient-to-b from-[#111827] to-[#0c121e] border border-[#1e2b45] p-5 shadow-2xl relative overflow-hidden font-mono-num select-none">
      {/* Background Accent Glow */}
      <div
        className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${
          isLong ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2b45] relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold text-white tracking-wide">{symbol}</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider ${
                isLong
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {direction}
            </span>
          </div>
          <span className="text-[10px] text-gray-400">{strategyName}</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-gray-500 font-bold block">Confidence</span>
          <span className="text-xs font-bold text-indigo-400 flex items-center justify-end gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {confidence}%
          </span>
        </div>
      </div>

      {/* Price Target Grid */}
      <div className="py-4 space-y-2 relative z-10 border-b border-[#1e2b45]">
        <div className="flex items-center justify-between py-1 px-2 rounded bg-[#080c14]/60 border border-[#1e2b45]">
          <span className="text-[11px] font-semibold text-gray-400">Entry</span>
          <span className="text-xs font-bold text-white">${entry.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between py-1 px-2 rounded bg-rose-500/10 border border-rose-500/20">
          <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Stop Loss
          </span>
          <span className="text-xs font-bold text-rose-400">${stopLoss.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Target className="w-3 h-3" />
            TP1 (25%)
          </span>
          <span className="text-xs font-bold text-emerald-400">${tp1.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Target className="w-3 h-3" />
            TP2 (25%)
          </span>
          <span className="text-xs font-bold text-emerald-400">${tp2.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Target className="w-3 h-3" />
            TP3 (25%)
          </span>
          <span className="text-xs font-bold text-emerald-400">${tp3.toLocaleString()}</span>
        </div>

        {tp4 && (
          <div className="flex items-center justify-between py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <Target className="w-3 h-3" />
              TP4 (25%)
            </span>
            <span className="text-xs font-bold text-emerald-400">${tp4.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Risk / Reward & Metric Breakdown */}
      <div className="pt-3 grid grid-cols-2 gap-2 text-xs relative z-10">
        <div className="bg-[#080c14] p-2 rounded border border-[#1e2b45]">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Risk</span>
          <span className="text-sm font-bold text-rose-400">-${riskAmount.toLocaleString()}</span>
        </div>

        <div className="bg-[#080c14] p-2 rounded border border-[#1e2b45]">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Max Reward</span>
          <span className="text-sm font-bold text-emerald-400">+${maxReward.toLocaleString()}</span>
        </div>

        <div className="bg-[#080c14] p-2 rounded border border-[#1e2b45]">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Risk / Reward</span>
          <span className="text-sm font-bold text-white">{riskReward}</span>
        </div>

        <div className="bg-[#080c14] p-2 rounded border border-[#1e2b45]">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Timeframe</span>
          <span className="text-sm font-bold text-indigo-400">{timeframe}</span>
        </div>
      </div>
    </div>
  );
};
