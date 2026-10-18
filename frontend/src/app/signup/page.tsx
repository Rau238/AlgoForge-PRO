"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import {
  Flame,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Coins,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAlgoForgeStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [traderType, setTraderType] = useState("QUANT");
  const [capitalAllocation, setCapitalAllocation] = useState("100");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passkeys do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must accept the algorithmic execution risk terms.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      login({
        name: fullName,
        email: email,
        role: traderType === "QUANT" ? "INSTITUTIONAL_ALGO_TRADER" : "QUANT_DERIVATIVES_TRADER",
        isAuthenticated: true,
      });
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 my-auto py-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
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
            Provision Institutional Trader Account
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Deploy algorithmic strategies with automated TP/SL risk management on Delta Exchange
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#0d1322]/95 border border-[#1e2b45] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Trader Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Raunak Verma"
                    className="w-full pl-9 pr-3 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-sans focus:outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Corporate / Terminal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="raunak@algoforge.io"
                    className="w-full pl-9 pr-3 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-sans focus:outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trading Profile & Starting Capital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Execution Profile
                </label>
                <select
                  value={traderType}
                  onChange={(e) => setTraderType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white text-xs font-sans focus:outline-none transition-all shadow-inner"
                >
                  <option value="QUANT">Quant Algorithmic Trader</option>
                  <option value="DERIVATIVES">Derivatives & Futures Scalper</option>
                  <option value="PROP">Proprietary Algo Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Initial Capital
                </label>
                <select
                  value={capitalAllocation}
                  onChange={(e) => setCapitalAllocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white text-xs font-mono focus:outline-none transition-all shadow-inner"
                >
                  <option value="100">$100.00 (Autonomous Micro-Pilot)</option>
                  <option value="1000">$1,000.00 (Standard Desk)</option>
                  <option value="10000">$10,000.00 (Pro Workstation)</option>
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-8 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-sans">
                  Confirm Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat passkey"
                    className="w-full pl-9 pr-3 py-2 bg-[#090d18] border border-[#1e2b45] focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms of Algorithmic Execution */}
            <div className="pt-1">
              <label className="flex items-start space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#1e2b45] bg-[#090d18] text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  I agree to automated sub-millisecond execution, Delta Exchange isolated leverage rules, and real-time risk controls.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold font-sans uppercase tracking-wider shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Allocating Terminal Seat..." : "Create Account & Launch Workstation"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Demo */}
          <div className="mt-4 pt-3 border-t border-[#17233c] text-center">
            <button
              onClick={() => {
                login({
                  name: "Raunak",
                  email: "raunak@algoforge.io",
                  role: "INSTITUTIONAL_ALGO_TRADER",
                  isAuthenticated: true,
                });
                router.push("/dashboard");
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold font-sans flex items-center justify-center gap-1 mx-auto"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Or click here to launch instant $100 Trader Terminal immediately</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-sans">
            Already have terminal credentials?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
