"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import {
  LayoutDashboard,
  Globe2,
  CandlestickChart,
  SlidersHorizontal,
  Cpu,
  Workflow,
  History,
  FlaskConical,
  Radio,
  FileSpreadsheet,
  Crosshair,
  PieChart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Layers,
  Flame,
} from "lucide-react";

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const { selectedSymbol, positions, autoTraderEnabled, wsConnected } = useAlgoForgeStore();
  const [collapsed, setCollapsed] = useState(false);

  const openPositionsCount = positions ? positions.filter((p) => p.status === "OPEN").length : 0;

  interface NavItem {
    label?: string;
    href?: string;
    icon?: React.ElementType;
    divider?: boolean;
    category?: string;
    badge?: string;
    badgeColor?: string;
  }

  // Streamlined, beginner-friendly navigation with no duplicate bloat
  const navItems: NavItem[] = [
    { divider: true, category: "Trading Desk" },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Live Chart",
      href: `/chart/${selectedSymbol}`,
      icon: CandlestickChart,
      badge: selectedSymbol,
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    },
    {
      label: "Open Positions",
      href: "/positions",
      icon: Crosshair,
      badge: openPositionsCount > 0 ? `${openPositionsCount} Open` : undefined,
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25 font-bold",
    },
    { label: "Working Orders", href: "/orders", icon: FileSpreadsheet },

    { divider: true, category: "Algorithmic Suite" },
    {
      label: "Auto-Pilot Bot",
      href: "/paper-trading",
      icon: Cpu,
      badge: autoTraderEnabled ? "$100 Auto" : "Manual",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    },
    {
      label: "Algo Strategies",
      href: "/strategies",
      icon: SlidersHorizontal,
      badge: "5 Deployed",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    },
    {
      label: "Crypto Intelligence",
      href: "/crypto-intelligence",
      icon: Flame,
      badge: "Live Map",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/25 font-bold",
    },
    { label: "Market Scanner", href: "/markets", icon: Globe2 },

    { divider: true, category: "Account & Performance" },
    { label: "Portfolio & History", href: "/portfolio", icon: PieChart },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`border-r border-[#152033] bg-[#090e1a]/98 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        collapsed ? "w-16" : "w-56"
      } shrink-0 z-30`}
    >
      {/* Scrollable Navigation Body */}
      <div className="py-2.5 px-2 overflow-y-auto overflow-x-hidden flex-1 space-y-0.5 custom-sidebar-scroll">
        {navItems.map((item, idx) => {
          if (item.divider) {
            if (collapsed) {
              return <div key={idx} className="my-2 mx-1 border-t border-[#18263f]" />;
            }
            return (
              <div
                key={idx}
                className="px-2.5 pt-3 pb-1 text-[9.5px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between"
              >
                <span>{item.category}</span>
                <span className="w-1 h-1 rounded-full bg-[#1e2e4a]" />
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive =
            pathname === item.href ||
            (item.label === "Live Chart" && pathname.startsWith("/chart/"));

          return (
            <Link
              key={item.href || idx}
              href={item.href || "#"}
              title={collapsed ? item.label : undefined}
              className={`flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group relative duration-150 ${
                isActive
                  ? "bg-indigo-600/15 text-white border border-indigo-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#121c2e] border border-transparent"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {/* Left Active Accent Bar */}
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-500 rounded-r" />
              )}

              {/* Icon */}
              <div className="relative shrink-0 flex items-center justify-center">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
              </div>

              {/* Label and Badge (Visible when expanded) */}
              {!collapsed && (
                <>
                  <span className="ml-3 truncate tracking-wide text-xs">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-md font-mono-num font-bold border tracking-tight shrink-0 flex items-center gap-1 ${
                        item.badgeColor || "bg-[#142036] text-slate-300 border-[#1f3050]"
                      }`}
                    >
                      <span>{item.badge}</span>
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer System Telemetry & Collapse Control */}
      <div className="p-2.5 border-t border-[#162238] bg-[#070b14]/90 space-y-2">
        {!collapsed && (
          <div className="bg-[#0b1222] border border-[#192742] rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>Execution Core</span>
              </span>
              <span className="font-mono-num font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ONLINE</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono-num">
              <span>Delta Exchange:</span>
              <span className="text-white font-semibold">25x Isolated</span>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono-num mt-0.5">
              <span>Auto-Pilot:</span>
              <span className={autoTraderEnabled ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {autoTraderEnabled ? "$100 Active" : "Paused"}
              </span>
            </div>
          </div>
        )}

        {/* Toggle Button & Version */}
        <div className="flex items-center justify-between pt-0.5">
          {!collapsed && (
            <div className="flex items-center space-x-1.5 px-1">
              <span className="text-[10px] text-slate-500 font-mono font-semibold">AlgoForge v1.0 PRO</span>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 hover:bg-[#142036] text-slate-400 hover:text-white rounded-lg transition-all border border-transparent hover:border-[#1e2e4a] ${
              collapsed ? "w-full flex justify-center" : "ml-auto"
            }`}
            title={collapsed ? "Expand Sidebar (Ctrl+\\)" : "Collapse Sidebar (Ctrl+\\)"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
