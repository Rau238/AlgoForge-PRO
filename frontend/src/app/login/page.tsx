"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import {
  Flame,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAlgoForgeStore();

  const [email, setEmail] = useState("raunak@algoforge.io");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your terminal credentials.");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      login({
        name: email.split("@")[0].toUpperCase(),
        email: email,
        role: "INSTITUTIONAL_ALGO_TRADER",
        isAuthenticated: true,
      });
      router.push("/dashboard");
    }, 450);
  };

  const handleInstantDemo = () => {
    login({
      name: "Raunak",
      email: "raunak@algoforge.io",
      role: "INSTITUTIONAL_ALGO_TRADER",
      isAuthenticated: true,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 my-auto py-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center space-x-2.5 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
                AlgoForge
              </span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/40 uppercase tracking-wider">
                PRO
              </span>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Institutional Algorithmic Workstation
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Autonomous multi-asset execution on live Delta Exchange & Binance feeds
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0d1322]/95 border border-[#1e2b45] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                Terminal Identifier / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@algoforge.io"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-sans focus:outline-none transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-sans">
                  Security Passkey
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Demo terminal credentials are auto-configured for Raunak.");
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-sans"
                >
                  Forgot passkey?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#1e2b45] bg-[#090d18] text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300 font-sans">Remember workstation terminal</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Feed Ready
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold font-sans uppercase tracking-wider shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Authenticating Session..." : "Access Algorithmic Workstation"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center space-x-3">
            <div className="flex-1 h-px bg-[#1e2b45]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Quick Trader Access
            </span>
            <div className="flex-1 h-px bg-[#1e2b45]" />
          </div>

          {/* Instant 1-Click Launch Button */}
          <button
            onClick={handleInstantDemo}
            className="w-full py-2.5 bg-[#121c32] hover:bg-[#182644] text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Launch Live Trader Terminal ($100 Capital)</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#0d1322]/60 border border-[#1e2b45]/60 flex flex-col items-center">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 mb-1" />
            <span className="text-[10px] font-bold text-white font-sans">Sub-ms Exec</span>
            <span className="text-[9px] text-slate-400">14ms latency</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0d1322]/60 border border-[#1e2b45]/60 flex flex-col items-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold text-white font-sans">Delta Derivatives</span>
            <span className="text-[9px] text-slate-400">25x Isolated</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0d1322]/60 border border-[#1e2b45]/60 flex flex-col items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mb-1" />
            <span className="text-[10px] font-bold text-white font-sans">4-Tier TP / SL</span>
            <span className="text-[9px] text-slate-400">Risk Protected</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-sans">
            Need an institutional trading seat?{" "}
            <Link
              href="/signup"
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
