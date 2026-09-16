import React, { useState } from "react";
import { Activity, Code2, FileCheck2, Flame, Menu, Trophy, X } from "lucide-react";
import { ActiveTab } from "../types";

interface HeaderProps {
  onOpenPresets: () => void;
  onResetTest: () => void;
  onCustomBlank?: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leaderboardCount: number;
}

const links: Array<{ tab: ActiveTab; label: string; icon: React.ElementType }> = [
  { tab: "system_benchmark", label: "Run the Benchies", icon: Activity },
  { tab: "benchmark_lab", label: "Single Test Lab", icon: FileCheck2 },
  { tab: "verbatim_diff", label: "Diff Inspector", icon: Code2 },
  { tab: "leaderboard", label: "Run History", icon: Trophy },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, leaderboardCount }) => {
  const [open, setOpen] = useState(false);

  const navigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("the_benchies")} className="group flex items-center gap-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center bg-red-600 transition group-hover:bg-red-500">
            <Flame className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-black uppercase tracking-[0.14em]">The Benchies</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Systems. Tested.</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map(({ tab, label, icon: Icon }) => (
            <button key={tab} onClick={() => navigate(tab)} className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
              <Icon className="h-4 w-4" /> {label}
              {tab === "leaderboard" && leaderboardCount > 0 && <span className="bg-zinc-700 px-1.5 font-mono text-[9px]">{leaderboardCount}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate("system_benchmark")} className="hidden bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-500 sm:block">Test your system</button>
        <button onClick={() => setOpen((value) => !value)} className="border border-zinc-700 p-2 lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-zinc-800 bg-black px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          {links.map(({ tab, label, icon: Icon }) => (
            <button key={tab} onClick={() => navigate(tab)} className={`flex w-full items-center gap-3 border-b border-zinc-900 px-3 py-4 text-left text-sm font-bold ${activeTab === tab ? "text-red-400" : "text-zinc-300"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};
