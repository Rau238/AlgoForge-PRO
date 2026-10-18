import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { TradePlannerDrawer } from "@/components/trade/TradePlannerDrawer";
import { AiCopilotChatDrawer } from "@/components/chat/AiCopilotChatDrawer";
import { NotificationToast } from "@/components/notifications/NotificationToast";

export const metadata: Metadata = {
  title: "AlgoForge PRO | Institutional Algorithmic Trading Workstation",
  description: "Autonomous Algorithmic Trading and Quantitative Execution Platform for Crypto & Commodities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#080c14] text-gray-200">
      <body className="h-full flex flex-col overflow-hidden bg-[#080c14] antialiased">
        <Suspense fallback={<div className="h-12 bg-[#070b14] border-b border-[#141f33]" />}>
          <TopBar />
        </Suspense>
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <Suspense fallback={<div className="w-52 bg-[#0d1322] border-r border-[#1e2b45]" />}>
            <LeftSidebar />
          </Suspense>
          <main className="flex-1 min-h-0 h-full flex flex-col overflow-hidden bg-[#080c14] relative">
            <Suspense
              fallback={
                <div className="flex-1 bg-[#080c14] p-8 text-center text-slate-500 font-mono">
                  Loading AlgoForge Workstation...
                </div>
              }
            >
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <TradePlannerDrawer />
            </Suspense>
            <Suspense fallback={null}>
              <AiCopilotChatDrawer />
            </Suspense>
            <NotificationToast />
          </main>
        </div>
      </body>
    </html>
  );
}
