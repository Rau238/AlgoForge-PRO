"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  X,
  User,
  Shield,
  Zap,
  TrendingUp,
  RotateCcw,
  LogOut,
  Sliders,
  DollarSign,
  Activity,
  CheckCircle2,
  ExternalLink,
  Bot,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, login, account, updateAccount, logout, autoTraderEnabled } = useAlgoForgeStore();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "Raunak");
  const [editEmail, setEditEmail] = useState(user?.email || "raunak@algoforge.io");

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      ...user,
      name: editName.trim() || "Raunak",
      email: editEmail.trim() || "raunak@algoforge.io",
      isAuthenticated: true,
    });
    setIsEditing(false);
    setResetMsg("Profile updated successfully!");
    setTimeout(() => setResetMsg(null), 3000);
  };

  const handleResetCapital = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetCapital(100.0);
      if (res?.account) {
        updateAccount(res.account);
      }
      setResetMsg("Account balance reset to exactly $100.00!");
      setTimeout(() => setResetMsg(null), 3000);
    } catch {
      updateAccount({ balance: 100.0, equity: 100.0, freeMargin: 100.0, usedMargin: 0, todaysPnl: 0 });
      setResetMsg("Account balance reset to $100.00!");
      setTimeout(() => setResetMsg(null), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  const isPos = account.todaysPnl >= 0;
  const pnlPct = account.balance > 0 ? (account.todaysPnl / account.balance) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#090d18] border border-[#1b2b48] rounded-2xl shadow-2xl overflow-hidden text-slate-200 font-sans animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#141f33] bg-[#0c1322] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "RK"}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Trader Profile</h2>
              <p className="text-[10px] text-slate-400 font-mono">Institutional ID: #AF-88219</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#152238] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* User Identity Card */}
          <div className="bg-[#0b101c] border border-[#141f33] rounded-xl p-3">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#070b14] border border-[#1a253a] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#070b14] border border-[#1a253a] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-[#121c2e] hover:bg-[#18263e] text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-white">{user?.name || "Raunak"}</p>
                      <button
                        onClick={() => {
                          setEditName(user?.name || "Raunak");
                          setEditEmail(user?.email || "raunak@algoforge.io");
                          setIsEditing(true);
                        }}
                        className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{user?.email || "raunak@algoforge.io"}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE PRO
                </span>
              </div>
            )}
          </div>

          {/* Capital & Margin Telemetry */}
          <div className="bg-[#0b101c] border border-[#141f33] rounded-xl p-3 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Capital & Margin Status ($100 Tier)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#070b14] p-2 rounded-lg border border-[#141f33]">
                <span className="text-[9.5px] text-slate-500 block">Account Balance</span>
                <span className="text-sm font-bold font-mono-num text-white">
                  ${account.balance.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#070b14] p-2 rounded-lg border border-[#141f33]">
                <span className="text-[9.5px] text-slate-500 block">Net Equity</span>
                <span className="text-sm font-bold font-mono-num text-emerald-400 flex items-center gap-1">
                  ${account.equity.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#070b14] p-2 rounded-lg border border-[#141f33]">
                <span className="text-[9.5px] text-slate-500 block">Free Margin</span>
                <span className="text-xs font-bold font-mono-num text-indigo-300">
                  ${account.freeMargin.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#070b14] p-2 rounded-lg border border-[#141f33]">
                <span className="text-[9.5px] text-slate-500 block">Today's P&L</span>
                <span className={`text-xs font-bold font-mono-num ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPos ? "+" : ""}${account.todaysPnl.toFixed(2)} ({isPos ? "+" : ""}{pnlPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Strategy & Risk Overview */}
          <div className="bg-[#0b101c] border border-[#141f33] rounded-xl p-3 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Risk & Execution Settings
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-[#141f33]/60">
                <span className="text-slate-400">Broker Gateway:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Delta Exchange Derivatives
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#141f33]/60">
                <span className="text-slate-400">Leverage:</span>
                <span className="text-white font-mono-num font-semibold">25x Isolated</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#141f33]/60">
                <span className="text-slate-400">Risk Per Trade:</span>
                <span className="text-emerald-400 font-mono-num font-semibold">2.0% ($2.00 max)</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Autonomous Auto-Pilot:</span>
                <span className={autoTraderEnabled ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {autoTraderEnabled ? "Active (Scanning 5 assets)" : "Paused"}
                </span>
              </div>
            </div>
          </div>

          {resetMsg && (
            <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{resetMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleResetCapital}
              disabled={isResetting}
              className="w-full py-2 bg-[#121c2e] hover:bg-[#16233a] border border-[#1c2c48] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-indigo-400" : ""}`} />
              <span>{isResetting ? "Resetting..." : "Reset Balance to $100.00 Capital"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/settings"
                onClick={onClose}
                className="py-2 bg-[#0d1424] hover:bg-[#121c2e] border border-[#141f33] text-indigo-300 hover:text-indigo-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>

              <Link
                href="/live-trading"
                onClick={onClose}
                className="py-2 bg-[#0d1424] hover:bg-[#121c2e] border border-[#141f33] text-amber-300 hover:text-amber-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Delta API</span>
              </Link>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
                router.push("/login");
              }}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
