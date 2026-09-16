import React from "react";
import { Trophy, BookOpen, RotateCcw, Code2, Sparkles, FileCheck2, Flame } from "lucide-react";
import { ActiveTab } from "../types";

interface HeaderProps {
  onOpenPresets: () => void;
  onResetTest: () => void;
  onCustomBlank?: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leaderboardCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onResetTest,
  onCustomBlank,
  activeTab,
  setActiveTab,
  leaderboardCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("the_benchies")}
            className="flex items-center space-x-2.5 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase group-hover:bg-slate-800 transition-colors shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>THE BENCHIES</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
              Open Arena
            </span>
          </button>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <span className="text-xs text-slate-500 hidden md:inline font-medium">
            Where Claims Meet Evidence • Pass or Fail in Public
          </span>
        </div>

        {/* Center Multi-Page Navigation Bar */}
        <nav aria-label="Main Pages" className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start xl:self-center overflow-x-auto max-w-full gap-0.5">
          <button
            type="button"
            id="nav-the-benchies"
            onClick={() => setActiveTab("the_benchies")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "the_benchies"
                ? "bg-white text-slate-950 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>The Benchies</span>
          </button>

          <button
            type="button"
            id="nav-verbatim-diff"
            onClick={() => setActiveTab("verbatim_diff")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "verbatim_diff"
                ? "bg-white text-slate-950 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>01 Code Diff</span>
          </button>

          <button
            type="button"
            id="nav-benchmark-lab"
            onClick={() => setActiveTab("benchmark_lab")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "benchmark_lab"
                ? "bg-white text-slate-950 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>02 Benchmark Lab</span>
          </button>

          <button
            type="button"
            id="nav-audit-deepdive"
            onClick={() => setActiveTab("audit_deepdive")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "audit_deepdive"
                ? "bg-white text-slate-950 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>03 Forensic Audit</span>
          </button>

          <button
            type="button"
            id="nav-leaderboard"
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-white text-slate-950 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>04 Public Ledger</span>
            {leaderboardCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-slate-200 text-slate-700 font-semibold">
                {leaderboardCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end xl:self-center">
          <button
            type="button"
            id="btn-load-presets"
            onClick={onOpenPresets}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Load benchmark test scenarios"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            id="btn-reset-test"
            onClick={onResetTest}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Reset active test workspace"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
