import React, { useState } from "react";
import { X, ShieldCheck, AlertTriangle, FileCheck2, CheckCircle2, ListFilter, Eye } from "lucide-react";
import { LeaderboardEntry } from "../types";

interface AuditModalProps {
  entry: LeaderboardEntry | null;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ entry, onClose }) => {
  const [activeTab, setActiveTab] = useState<"highlight" | "sentences" | "raw">("highlight");

  if (!entry) return null;

  const { metrics, modelName, testTitle, modelOutput, contextSnippet, promptSnippet, notes, timestamp } = entry;

  return (
    <div className="fixed inset-0 bg-[#141414]/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#141414] overflow-hidden text-[#141414]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#141414] flex items-center justify-between bg-[#E4E3E0]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-[#141414] bg-[#141414] text-white">
                {modelName}
              </span>
              <span className="text-[10px] font-mono text-[#141414]/70">
                AUDIT_ID: {new Date(timestamp).toISOString()}
              </span>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#141414] mt-1 font-mono">
              {testTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#141414] bg-white p-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 border border-[#141414]">
              <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">Groundedness</span>
              <span className="text-2xl font-mono font-black text-[#141414]">{metrics.groundednessScore}%</span>
            </div>
            <div className="bg-white p-3 border border-[#141414]">
              <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">Hallucination Risk</span>
              <span className="text-2xl font-mono font-black text-rose-600">{metrics.hallucinationScore}%</span>
            </div>
            <div className="bg-white p-3 border border-[#141414]">
              <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">Verbatim Overlap</span>
              <span className="text-2xl font-mono font-black text-[#141414]">{metrics.verbatimScore}%</span>
            </div>
          </div>

          {notes && (
            <div className="p-2.5 bg-[#F5F5F3] border border-[#141414] text-xs font-mono">
              <strong className="uppercase font-bold opacity-60 text-[9px] block">TEST_NOTES:</strong>
              <p className="font-serif italic text-xs mt-0.5">{notes}</p>
            </div>
          )}

          {/* Reference Prompt & Context Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-[#D9D8D5] border border-[#141414]">
              <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block mb-1">03 Benchmark Prompt</span>
              <p className="text-[#141414] line-clamp-4 font-mono text-[11px]">{promptSnippet}</p>
            </div>
            <div className="p-3 bg-white border border-[#141414]">
              <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block mb-1">02 Context Snippet</span>
              <p className="text-[#141414] line-clamp-4 font-mono text-[11px]">{contextSnippet}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border border-[#141414] bg-[#E4E3E0] p-0.5 space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab("highlight")}
              className={`px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition-all ${
                activeTab === "highlight" ? "bg-[#141414] text-[#E4E3E0]" : "text-[#141414] hover:bg-white/60"
              }`}
            >
              Highlight Diff
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sentences")}
              className={`px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition-all ${
                activeTab === "sentences" ? "bg-[#141414] text-[#E4E3E0]" : "text-[#141414] hover:bg-white/60"
              }`}
            >
              Sentence Verification ({metrics.sentenceBreakdown.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1 font-bold uppercase text-[10px] tracking-wider transition-all ${
                activeTab === "raw" ? "bg-[#141414] text-[#E4E3E0]" : "text-[#141414] hover:bg-white/60"
              }`}
            >
              Raw Output
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "highlight" && (
            <div className="p-3.5 bg-white border border-[#141414] leading-relaxed font-mono text-xs text-[#141414]">
              {metrics.highlightTokens.map((token, idx) => {
                if (token.type === "verbatim") {
                  return (
                    <span key={idx} className="bg-emerald-200 text-emerald-950 font-bold border border-emerald-400 px-0.5">
                      {token.text}
                    </span>
                  );
                }
                if (token.type === "hallucination") {
                  return (
                    <span key={idx} className="bg-rose-200 text-rose-950 font-bold border border-rose-600 px-0.5">
                      {token.text}
                    </span>
                  );
                }
                if (token.type === "grounded") {
                  return (
                    <span key={idx} className="bg-teal-100 text-teal-950 border-b border-teal-500 px-0.5">
                      {token.text}
                    </span>
                  );
                }
                return <span key={idx}>{token.text}</span>;
              })}
            </div>
          )}

          {activeTab === "sentences" && (
            <div className="space-y-2">
              {metrics.sentenceBreakdown.map((s) => (
                <div key={s.id} className="p-3 bg-white border border-[#141414] space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.2 border text-[9px] font-bold uppercase ${
                        s.status === "grounded"
                          ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                          : s.status === "partial"
                          ? "bg-amber-100 text-amber-950 border-amber-400"
                          : "bg-rose-100 text-rose-950 border-rose-500"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="font-mono text-[#141414]/70 text-[10px]">{s.overlapScore}% overlap</span>
                  </div>
                  <p className="font-mono text-xs text-[#141414]">"{s.text}"</p>
                  <p className="font-serif italic text-xs text-[#141414]/70">{s.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "raw" && (
            <div className="p-3.5 bg-[#F5F5F3] border border-[#141414] whitespace-pre-wrap font-mono text-xs text-[#141414] leading-relaxed">
              {modelOutput}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#141414] bg-[#E4E3E0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-[#141414] px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#141414]/90"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
