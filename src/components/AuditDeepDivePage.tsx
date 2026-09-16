import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Filter,
  Layers,
  Sparkles,
  Search,
  Check,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { EvaluationMetrics } from "../types";

interface AuditDeepDivePageProps {
  metrics: EvaluationMetrics | null;
  context: string;
  prompt: string;
  modelOutput: string;
  isAiEvaluating: boolean;
  onRunAiEvaluation: () => void;
  onNavigateToLab: () => void;
}

export const AuditDeepDivePage: React.FC<AuditDeepDivePageProps> = ({
  metrics,
  context,
  prompt,
  modelOutput,
  isAiEvaluating,
  onRunAiEvaluation,
  onNavigateToLab,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "grounded" | "partial" | "hallucination">("all");
  const [activeTab, setActiveTab] = useState<"tokens" | "sentences" | "entities" | "ai_judge">("tokens");
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);

  if (!metrics || !modelOutput.trim()) {
    return (
      <div className="bg-white border border-[#141414] p-8 text-center space-y-4">
        <FileCheck2 className="w-10 h-10 text-[#141414]/40 mx-auto" />
        <h3 className="font-mono text-base font-bold uppercase tracking-wider text-[#141414]">
          No Evaluation Audit Data Available Yet
        </h3>
        <p className="font-serif italic text-sm text-[#141414]/75 max-w-md mx-auto">
          Run an audit in the <strong>Verbatim &amp; Code Diff</strong> or <strong>Benchmark Lab</strong> page first to inspect granular tokens, sentence-level proofs, and AI Judge analysis.
        </p>
        <button
          type="button"
          onClick={onNavigateToLab}
          className="border border-[#141414] bg-[#141414] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#141414]/80"
        >
          Go to Benchmark Lab
        </button>
      </div>
    );
  }

  const filteredSentences = metrics.sentenceBreakdown.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  const selectedSentence = metrics.sentenceBreakdown.find((s) => s.id === selectedSentenceId);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#141414] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-[#141414]" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#141414]">
              Deep-Dive Grounding &amp; AI Fact-Checking Audit
            </h2>
            <span className="font-mono text-[9px] px-2 py-0.5 border border-[#141414] bg-[#E4E3E0] font-bold uppercase">
              Claim Level Analysis
            </span>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/75 mt-1">
            Sentence-by-sentence factual verification, token-level overlap highlights, entity extraction audit, and Gemini semantic judge.
          </p>
        </div>

        {/* AI Judge CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunAiEvaluation}
            disabled={isAiEvaluating}
            className="border border-[#141414] bg-[#141414] hover:bg-[#141414]/90 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{isAiEvaluating ? "Judging with Gemini..." : "Run Deep Gemini AI Judge"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 border border-[#141414]">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
            Groundedness
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414]">
            {metrics.groundednessScore}%
          </span>
          <span className="text-[10px] font-mono text-[#141414]/70 block mt-0.5">
            {metrics.groundedSentencesCount}/{metrics.totalSentences} verified claims
          </span>
        </div>

        <div className="bg-white p-3.5 border border-[#141414]">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
            Hallucination Risk
          </span>
          <span className={`text-2xl font-mono font-bold ${
            metrics.hallucinationScore > 0 ? "text-rose-700" : "text-emerald-700"
          }`}>
            {metrics.hallucinationScore}%
          </span>
          <span className="text-[10px] font-mono text-[#141414]/70 block mt-0.5">
            {metrics.hallucinatedSentencesCount} unsupported units
          </span>
        </div>

        <div className="bg-white p-3.5 border border-[#141414]">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
            Verbatim Overlap
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414]">
            {metrics.verbatimScore}%
          </span>
          <span className="text-[10px] font-mono text-[#141414]/70 block mt-0.5">
            {metrics.verbatimPhraseCount} matching phrases
          </span>
        </div>

        <div className="bg-white p-3.5 border border-[#141414]">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
            Entity Accuracy
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414]">
            {metrics.entities.groundedInOutput.length}
            <span className="text-sm font-normal text-[#141414]/60">
              /{metrics.entities.groundedInOutput.length + metrics.entities.novelInOutput.length}
            </span>
          </span>
          <span className="text-[10px] font-mono text-[#141414]/70 block mt-0.5">
            {metrics.entities.novelInOutput.length} novel entities
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Token Inspector, Sentence Breakdown, Entities, AI Judge */}
      <div className="flex border border-[#141414] bg-[#E4E3E0] p-0.5 self-start flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("tokens")}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === "tokens" ? "bg-[#141414] text-white" : "text-[#141414] hover:bg-white/60"
          }`}
        >
          01 Token Diff Highlighter
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sentences")}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === "sentences" ? "bg-[#141414] text-white" : "text-[#141414] hover:bg-white/60"
          }`}
        >
          02 Sentence &amp; Claim Ledger ({metrics.sentenceBreakdown.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("entities")}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === "entities" ? "bg-[#141414] text-white" : "text-[#141414] hover:bg-white/60"
          }`}
        >
          03 Entity Verification Ledger
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai_judge")}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
            activeTab === "ai_judge" ? "bg-[#141414] text-white" : "text-[#141414] hover:bg-white/60"
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>04 Gemini AI Judge</span>
          {metrics.aiAudit && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1"></span>
          )}
        </button>
      </div>

      {/* TAB 1: Visual Token Highlighter */}
      {activeTab === "tokens" && (
        <div className="bg-white border border-[#141414] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141414]/15 pb-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                Granular Token Highlighting
              </span>
              <p className="font-serif italic text-xs text-[#141414]/70">
                Visualizing verbatim quotes, grounded context, and novel unsupported tokens.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-300 inline-block border border-emerald-600"></span>
                Verbatim Quote
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-teal-100 inline-block border border-teal-500"></span>
                Grounded Token
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-200 inline-block border border-rose-600"></span>
                Novel / Fabricated
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#F5F5F3] border border-[#141414] font-mono text-xs leading-relaxed text-[#141414] whitespace-pre-wrap">
            {metrics.highlightTokens.map((token, idx) => {
              if (token.type === "verbatim") {
                return (
                  <span
                    key={idx}
                    className="bg-emerald-200 text-emerald-950 font-bold border-b-2 border-emerald-600 px-0.5"
                    title="Verbatim matched sequence"
                  >
                    {token.text}
                  </span>
                );
              }
              if (token.type === "hallucination") {
                return (
                  <span
                    key={idx}
                    className="bg-rose-200 text-rose-950 font-bold border-b-2 border-rose-600 px-0.5"
                    title="Unsupported novel token not found in context"
                  >
                    {token.text}
                  </span>
                );
              }
              if (token.type === "grounded") {
                return (
                  <span
                    key={idx}
                    className="bg-teal-100 text-teal-950 border-b border-teal-500 px-0.5"
                    title="Grounded in context"
                  >
                    {token.text}
                  </span>
                );
              }
              return <span key={idx}>{token.text}</span>;
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Sentence & Claim Ledger */}
      {activeTab === "sentences" && (
        <div className="bg-white border border-[#141414] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414]/15 pb-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                Sentence &amp; Claim Breakdown Ledger
              </span>
              <p className="font-serif italic text-xs text-[#141414]/70">
                Click on any sentence to inspect the matched context snippet and rationale.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 border border-[#141414] p-0.5 bg-[#E4E3E0]">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  filterStatus === "all" ? "bg-[#141414] text-white" : "hover:bg-white/60"
                }`}
              >
                All ({metrics.sentenceBreakdown.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("grounded")}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-800 ${
                  filterStatus === "grounded" ? "bg-emerald-800 text-white" : "hover:bg-white/60"
                }`}
              >
                Grounded ({metrics.groundedSentencesCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("partial")}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-amber-800 ${
                  filterStatus === "partial" ? "bg-amber-800 text-white" : "hover:bg-white/60"
                }`}
              >
                Partial ({metrics.partialSentencesCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("hallucination")}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-rose-800 ${
                  filterStatus === "hallucination" ? "bg-rose-800 text-white" : "hover:bg-white/60"
                }`}
              >
                Hallucination ({metrics.hallucinatedSentencesCount})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSentences.map((sentence) => {
              const isSelected = selectedSentenceId === sentence.id;
              return (
                <div
                  key={sentence.id}
                  onClick={() => setSelectedSentenceId(isSelected ? null : sentence.id)}
                  className={`border p-3.5 transition-all cursor-pointer ${
                    isSelected ? "border-[#141414] ring-1 ring-[#141414] bg-[#F5F5F3]" : "border-[#141414]/20 hover:border-[#141414] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                          sentence.status === "grounded"
                            ? "bg-emerald-100 text-emerald-950 border-emerald-500"
                            : sentence.status === "partial"
                            ? "bg-amber-100 text-amber-950 border-amber-500"
                            : "bg-rose-100 text-rose-950 border-rose-500"
                        }`}
                      >
                        {sentence.status}
                      </span>
                      <span className="font-mono text-[10px] text-[#141414]/60">
                        Overlap: {sentence.overlapScore}%
                      </span>
                    </div>

                    <span className="font-mono text-[9px] text-[#141414]/50 uppercase">
                      {isSelected ? "Click to collapse" : "Click to inspect evidence"}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-[#141414] leading-relaxed">
                    "{sentence.text}"
                  </p>

                  <p className="font-serif italic text-xs text-[#141414]/75 mt-1">
                    {sentence.explanation}
                  </p>

                  {/* Expanded Context Match Snippet */}
                  {isSelected && sentence.matchedContextSnippet && (
                    <div className="mt-3 p-3 bg-white border border-[#141414] space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#141414]/70 block">
                        Matched Reference Context Evidence:
                      </span>
                      <p className="font-mono text-[11px] text-[#141414] bg-[#E4E3E0]/30 p-2 border border-[#141414]/10">
                        {sentence.matchedContextSnippet}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Entity Verification Ledger */}
      {activeTab === "entities" && (
        <div className="bg-white border border-[#141414] p-5 space-y-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
              Entity &amp; Metric Verification Ledger
            </span>
            <p className="font-serif italic text-xs text-[#141414]/70 mt-0.5">
              Tracks capitalized proper names, numerical values, currency figures, and dates appearing in the context versus the evaluated model output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grounded Entities in Output */}
            <div className="border border-[#141414] p-4 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
                <span className="font-mono text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified in Context ({metrics.entities.groundedInOutput.length})
                </span>
              </div>
              {metrics.entities.groundedInOutput.length === 0 ? (
                <p className="font-serif italic text-xs text-[#141414]/50 py-3">No specific entities detected in output.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {metrics.entities.groundedInOutput.map((ent, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px] bg-emerald-50 text-emerald-950 border border-emerald-400 px-2 py-0.5"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Novel / Unsupported Entities */}
            <div className="border border-[#141414] p-4 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2">
                <span className="font-mono text-xs font-bold uppercase text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Novel / Fabricated ({metrics.entities.novelInOutput.length})
                </span>
              </div>
              {metrics.entities.novelInOutput.length === 0 ? (
                <p className="font-serif italic text-xs text-emerald-700 py-3">
                  Zero novel entities detected. All extracted proper nouns and metrics originate in the context.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {metrics.entities.novelInOutput.map((ent, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px] bg-rose-50 text-rose-950 border border-rose-500 px-2 py-0.5 font-bold"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Gemini AI Judge Analysis */}
      {activeTab === "ai_judge" && (
        <div className="bg-white border border-[#141414] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414]/15 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-[#141414]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  Gemini Semantic Fact-Checker &amp; Hallucination Judge
                </span>
              </div>
              <p className="font-serif italic text-xs text-[#141414]/70 mt-0.5">
                AI-as-a-Judge semantic reasoning that checks nuance, paraphrasing, implied statements, and adversarial trap resistance.
              </p>
            </div>

            <button
              type="button"
              onClick={onRunAiEvaluation}
              disabled={isAiEvaluating}
              className="border border-[#141414] bg-[#141414] text-white px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#141414]/90 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiEvaluating ? "Judging..." : "Run AI Fact-Check"}</span>
            </button>
          </div>

          {metrics.aiAudit ? (
            <div className="space-y-4">
              {/* Verdict Header */}
              <div className="p-4 bg-[#E4E3E0] border border-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold tracking-widest opacity-60 block">
                    AI JUDGE VERDICT
                  </span>
                  <span className="font-mono text-lg font-bold text-[#141414]">
                    {metrics.aiAudit.verdict}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase font-bold opacity-60 block">AI Groundedness</span>
                    <span className="font-mono text-xl font-bold text-[#141414]">
                      {metrics.aiAudit.groundednessScore}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase font-bold opacity-60 block">AI Hallucination</span>
                    <span className={`font-mono text-xl font-bold ${
                      metrics.aiAudit.hallucinationScore > 0 ? "text-rose-700" : "text-emerald-700"
                    }`}>
                      {metrics.aiAudit.hallucinationScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-4 bg-white border border-[#141414] space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141414]">
                  Judicial Reasoning &amp; Evidence Synthesis:
                </span>
                <p className="font-serif text-sm text-[#141414] leading-relaxed">
                  {metrics.aiAudit.reasoning}
                </p>
              </div>

              {/* Supported vs Unsupported claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#141414] p-4 bg-emerald-50/40 space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-emerald-900 block border-b border-emerald-300 pb-1">
                    Verified Supported Claims ({metrics.aiAudit.supportedClaims.length})
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside font-mono text-[11px] text-emerald-950">
                    {metrics.aiAudit.supportedClaims.map((claim, idx) => (
                      <li key={idx} className="leading-snug">{claim}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#141414] p-4 bg-rose-50/40 space-y-2">
                  <span className="font-mono text-xs font-bold uppercase text-rose-900 block border-b border-rose-300 pb-1">
                    Fabricated / Ungrounded Claims ({metrics.aiAudit.unsupportedClaims.length})
                  </span>
                  {metrics.aiAudit.unsupportedClaims.length === 0 ? (
                    <p className="font-serif italic text-xs text-emerald-700">No unsupported claims detected by the AI Judge.</p>
                  ) : (
                    <ul className="space-y-1.5 list-disc list-inside font-mono text-[11px] text-rose-950">
                      {metrics.aiAudit.unsupportedClaims.map((claim, idx) => (
                        <li key={idx} className="leading-snug">{claim}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-[#141414] bg-[#F5F5F3] text-center space-y-3">
              <BrainCircuit className="w-8 h-8 text-[#141414]/50 mx-auto" />
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                Run Gemini AI Fact-Checking Judge
              </h4>
              <p className="font-serif italic text-xs text-[#141414]/75 max-w-md mx-auto">
                Trigger an automated evaluation by Gemini 3.8 Flash to analyze semantic claims, nuanced paraphrasing, and adversarial traps.
              </p>
              <button
                type="button"
                onClick={onRunAiEvaluation}
                disabled={isAiEvaluating}
                className="border border-[#141414] bg-[#141414] text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#141414]/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiEvaluating ? "Analyzing..." : "Trigger AI Judge Now"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
