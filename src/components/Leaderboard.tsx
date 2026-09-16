import React, { useState, useMemo } from "react";
import {
  Trophy,
  Medal,
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onInspectEntry: (entry: LeaderboardEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onSeedSamples: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  onInspectEntry,
  onDeleteEntry,
  onClearAll,
  onSeedSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"groundedness" | "hallucination" | "verbatim" | "date">("groundedness");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtering & Sorting
  const sortedEntries = useMemo(() => {
    let list = entries.filter((e) => {
      const matchSearch =
        e.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === "groundedness") {
        valA = a.metrics.groundednessScore;
        valB = b.metrics.groundednessScore;
      } else if (sortBy === "hallucination") {
        valA = a.metrics.hallucinationScore;
        valB = b.metrics.hallucinationScore;
      } else if (sortBy === "verbatim") {
        valA = a.metrics.verbatimScore;
        valB = b.metrics.verbatimScore;
      } else if (sortBy === "date") {
        valA = a.timestamp;
        valB = b.timestamp;
      }

      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    return list;
  }, [entries, searchTerm, sortBy, sortOrder]);

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const headers = ["Rank", "Model Name", "Test Title", "Groundedness %", "Hallucination Risk %", "Verbatim %", "Date", "Notes"];
    const rows = sortedEntries.map((e, idx) => [
      idx + 1,
      `"${e.modelName.replace(/"/g, '""')}"`,
      `"${e.testTitle.replace(/"/g, '""')}"`,
      e.metrics.groundednessScore,
      e.metrics.hallucinationScore,
      e.metrics.verbatimScore,
      new Date(e.timestamp).toISOString(),
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hallucination_benchmark_leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (entries.length === 0) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `hallucination_benchmark_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 py-0.5 border border-[#141414] bg-[#141414] text-white font-mono text-[10px] font-bold">
          #1_GOLD
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 py-0.5 border border-[#141414] bg-[#D9D8D5] text-[#141414] font-mono text-[10px] font-bold">
          #2_SILVER
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 py-0.5 border border-[#141414] bg-[#E4E3E0] text-[#141414] font-mono text-[10px] font-bold">
          #3_BRONZE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-1.5 py-0.5 border border-[#141414]/40 bg-white text-[#141414] font-mono text-[10px]">
        #{index + 1}
      </span>
    );
  };

  return (
    <div className="bg-white border border-[#141414] p-5 space-y-4 text-[#141414]">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#141414]">
        <div>
          <div className="flex items-center gap-2">
            <span className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              06 Benchmark Rankings &amp; Evaluation Ledger
            </span>
          </div>
          <h2 className="text-base font-bold uppercase tracking-wide text-[#141414] mt-0.5 font-mono">
            Hallucination &amp; Grounding Leaderboard ({entries.length} Records)
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {entries.length > 0 && (
            <>
              <button
                type="button"
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="border border-[#141414] bg-white px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>EXPORT CSV</span>
              </button>
              <button
                type="button"
                id="btn-clear-leaderboard"
                onClick={onClearAll}
                className="border border-[#141414] bg-white px-2 py-1 text-[9px] uppercase font-bold tracking-wider text-rose-700 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
                title="Clear all entries"
              >
                <Trash2 className="w-3 h-3" />
                <span>PURGE</span>
              </button>
            </>
          )}

          <button
            type="button"
            id="btn-seed-samples"
            onClick={onSeedSamples}
            className="border border-[#141414] bg-[#E4E3E0] px-3 py-1 text-[9px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3" />
            <span>LOAD SAMPLES (CLAUDE / GPT / 7B)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 border border-[#141414] bg-[#F5F5F3]">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#141414]/50 absolute left-2.5 top-2" />
          <input
            id="search-leaderboard-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER BY MODEL, QUERY, OR TAG..."
            className="w-full pl-8 pr-2 py-1 text-xs font-mono bg-white border border-[#141414] outline-none focus:ring-1 focus:ring-[#141414] uppercase placeholder:normal-case"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono text-[10px] uppercase font-bold opacity-60 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            <span>SORT:</span>
          </span>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 text-xs font-mono bg-white border border-[#141414] outline-none"
          >
            <option value="groundedness">HIGHEST GROUNDEDNESS</option>
            <option value="hallucination">LOWEST HALLUCINATION RISK</option>
            <option value="verbatim">HIGHEST VERBATIM OVERLAP</option>
            <option value="date">MOST RECENT TEST</option>
          </select>

          <button
            type="button"
            id="btn-toggle-sort-order"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-2 py-1 text-xs font-mono font-bold border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
            title="Toggle sort direction"
          >
            {sortOrder === "desc" ? "DESC" : "ASC"}
          </button>
        </div>
      </div>

      {/* Table of Entries */}
      {sortedEntries.length === 0 ? (
        <div className="text-center py-10 px-4 border border-[#141414] border-dashed bg-[#F5F5F3] space-y-2.5">
          <Trophy className="w-6 h-6 mx-auto text-[#141414]/40" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
            ZERO_LEDGER_RECORDS_FOUND
          </h3>
          <p className="font-serif italic text-xs text-[#141414]/70 max-w-sm mx-auto">
            Evaluate a model response and click "Save To Leaderboard", or load comparison samples to inspect rankings.
          </p>
          <button
            type="button"
            id="btn-seed-empty-state"
            onClick={onSeedSamples}
            className="border border-[#141414] bg-[#141414] text-white px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] hover:bg-[#141414]/90 transition-colors"
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            <span>LOAD SAMPLE COMPARISONS</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#141414]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141414] text-[#E4E3E0] uppercase text-[9px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-center w-24">RANK</th>
                <th className="py-2.5 px-3">MODEL_IDENTITY</th>
                <th className="py-2.5 px-3">BENCHMARK_PROMPT</th>
                <th className="py-2.5 px-3 text-center">GROUNDEDNESS</th>
                <th className="py-2.5 px-3 text-center">HALLUCINATION</th>
                <th className="py-2.5 px-3 text-center">VERBATIM%</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3 text-right">AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/15 bg-white">
              {sortedEntries.map((entry, index) => {
                const gScore = entry.metrics.groundednessScore;
                const hScore = entry.metrics.hallucinationScore;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-[#F5F5F3] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center">
                      {getRankBadge(index)}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#141414]">
                      <div className="flex items-center gap-1.5">
                        <span>{entry.modelName}</span>
                      </div>
                      {entry.notes && (
                        <span className="text-[10px] text-[#141414]/60 font-serif italic block truncate max-w-xs font-normal">
                          {entry.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[#141414]/80 max-w-xs truncate font-sans text-xs">
                      {entry.testTitle}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 border text-[10px] font-bold ${
                          gScore >= 80
                            ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                            : gScore >= 50
                            ? "bg-amber-100 text-amber-950 border-amber-400"
                            : "bg-rose-100 text-rose-950 border-rose-400"
                        }`}
                      >
                        {gScore}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 border text-[10px] font-bold ${
                          hScore <= 20
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : hScore <= 50
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-rose-100 text-rose-950 border-rose-500"
                        }`}
                      >
                        {hScore}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center text-[#141414]">
                      {entry.metrics.verbatimScore}%
                    </td>

                    <td className="py-2.5 px-3 text-[#141414]/60 text-[10px]">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        id={`btn-inspect-${entry.id}`}
                        onClick={() => onInspectEntry(entry)}
                        className="border border-[#141414] p-1 text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
                        title="Inspect full audit report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        id={`btn-delete-${entry.id}`}
                        onClick={() => onDeleteEntry(entry.id)}
                        className="border border-[#141414]/40 p-1 text-[#141414]/60 hover:text-rose-600 hover:border-rose-600 transition-colors"
                        title="Delete run"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
