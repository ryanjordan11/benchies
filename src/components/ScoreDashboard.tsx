import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  BookmarkPlus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListFilter,
  Eye,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EvaluationMetrics, AIEvaluationResult } from "../types";

interface ScoreDashboardProps {
  metrics: EvaluationMetrics;
  modelName: string;
  context: string;
  prompt: string;
  modelOutput: string;
  onSaveToLeaderboard: (notes: string) => void;
  onRunAIEvaluation?: () => Promise<void>;
  aiEvaluation?: AIEvaluationResult | null;
  isAIEvaluationLoading?: boolean;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  metrics,
  modelName,
  context,
  prompt,
  modelOutput,
  onSaveToLeaderboard,
  onRunAIEvaluation,
  aiEvaluation,
  isAIEvaluationLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"highlight" | "sentences" | "entities" | "ai_judge">("highlight");
  const [notes, setNotes] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [expandedSentenceId, setExpandedSentenceId] = useState<string | null>(null);

  // Grade determination
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", label: "Verified Grounded", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 80) return { grade: "A", label: "High Groundedness", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (score >= 70) return { grade: "B", label: "Minor Extrapolation", color: "text-teal-700 bg-teal-50 border-teal-200" };
    if (score >= 50) return { grade: "C", label: "Moderate Risk", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (score >= 30) return { grade: "D", label: "High Hallucination", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { grade: "F", label: "Severe Hallucination", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const gradeInfo = getGrade(metrics.groundednessScore);

  const handleSave = () => {
    onSaveToLeaderboard(notes);
    setShowSaveModal(false);
    setNotes("");
  };

  return (
    <div className="bg-white border border-[#141414] p-5 space-y-5 text-[#141414]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#141414]">
        <div>
          <div className="flex items-center gap-2">
            <span className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              05 Score Analysis &amp; Diagnostic Audit
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#E4E3E0] border border-[#141414] text-[#141414]">
              {modelName || "UNSPECIFIED_MODEL"}
            </span>
          </div>
          <h2 className="text-base font-bold uppercase tracking-wide text-[#141414] mt-1 font-mono">
            Grounding Verification: {gradeInfo.label} ({gradeInfo.grade})
          </h2>
        </div>

        {/* Save to Leaderboard Button */}
        <button
          type="button"
          id="btn-open-save-modal"
          onClick={() => setShowSaveModal(true)}
          className="border border-[#141414] bg-[#141414] text-white hover:bg-[#141414]/90 px-4 py-2 font-bold uppercase tracking-wider text-[10px] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Save To Leaderboard</span>
        </button>
      </div>

      {/* Exact 100% Grounded Confirmation Banner */}
      {(metrics.groundednessScore === 100 || metrics.verbatimStats?.exactMatch || metrics.verbatimScore === 100) && (
        <div className="p-3 border border-emerald-600 bg-emerald-50 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                {metrics.verbatimStats?.exactMatch || metrics.verbatimScore === 100
                  ? "100% Verbatim Source Match Confirmed"
                  : "100% Grounded: Zero Hallucination Confirmed"}
              </span>
              <span className="font-serif italic text-xs text-emerald-800">
                {metrics.verbatimStats?.exactMatch || metrics.verbatimScore === 100
                  ? "The evaluated response matches the source context verbatim without fabricated additions."
                  : "All statements and entities are fully grounded in the provided source context with no novel hallucinations."}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 border border-emerald-600 bg-white text-emerald-800 font-bold uppercase shrink-0 self-start sm:self-auto">
            ZERO_HALLUCINATION_VERIFIED
          </span>
        </div>
      )}

      {/* Prompt Entity Attribution Note */}
      {metrics.scoringExplanation?.promptReferencedEntities && metrics.scoringExplanation.promptReferencedEntities.length > 0 && (
        <div className="p-2.5 border border-[#141414] bg-[#F5F5F3] flex items-center justify-between text-xs font-mono">
          <span className="text-[#141414]/70">
            Prompt Terms Preserved (not flagged as hallucinations):
          </span>
          <span className="font-bold text-[#141414] bg-white border border-[#141414] px-2 py-0.5">
            {metrics.scoringExplanation.promptReferencedEntities.join(", ")}
          </span>
        </div>
      )}

      {/* High-Density Bar Meters & Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border border-[#141414] bg-[#F5F5F3]">
        {/* Left: Score Big Display */}
        <div className="lg:col-span-4 flex flex-col justify-between p-3 border border-[#141414] bg-white">
          <div>
            <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
              Calculated Groundedness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-mono font-black text-[#141414] leading-none">
                {metrics.groundednessScore}%
              </span>
              <span className="font-mono text-xs font-bold border border-[#141414] px-1.5 py-0.5 bg-[#E4E3E0]">
                GRADE: {gradeInfo.grade}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#141414]/20 font-serif italic text-xs text-[#141414]/80">
            {gradeInfo.label} • {metrics.sentenceBreakdown.length} statements verified
          </div>
        </div>

        {/* Right: Technical Progress Bar Meters */}
        <div className="lg:col-span-8 flex flex-col justify-center gap-3 p-3 border border-[#141414] bg-white">
          {/* Bar 1: Context Adherence / Groundedness */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#141414]">
                Context Adherence
              </span>
              <span className="font-mono text-[10px] text-[#141414]/60">
                ({metrics.groundednessScore}%)
              </span>
            </div>
            <div className="w-full sm:w-56 h-2.5 bg-white border border-[#141414]">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${metrics.groundednessScore}%` }}
              />
            </div>
          </div>

          {/* Bar 2: Verbatim Accuracy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#141414]">
                Verbatim Quotes
              </span>
              <span className="font-mono text-[10px] text-[#141414]/60">
                ({metrics.verbatimScore}% / {metrics.verbatimPhraseCount} phrases)
              </span>
            </div>
            <div className="w-full sm:w-56 h-2.5 bg-white border border-[#141414]">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${metrics.verbatimScore}%` }}
              />
            </div>
          </div>

          {/* Bar 3: Hallucination Risk */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#141414]">
                Hallucination Risk
              </span>
              <span className="font-mono text-[10px] text-rose-600 font-bold">
                ({metrics.hallucinationScore}%)
              </span>
            </div>
            <div className="w-full sm:w-56 h-2.5 bg-white border border-[#141414]">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${metrics.hallucinationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-[#141414] bg-white">
          <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
            Grounded Score
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414] mt-1 block">
            {metrics.groundednessScore}%
          </span>
          <span className="font-mono text-[9px] text-[#141414]/70 mt-1 block">
            VERIFIED IN SOURCE
          </span>
        </div>

        <div className="p-3 border border-[#141414] bg-white">
          <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
            Hallucination Rate
          </span>
          <span className={`text-2xl font-mono font-bold mt-1 block ${metrics.hallucinationScore > 20 ? "text-rose-600" : "text-[#141414]"}`}>
            {metrics.hallucinationScore}%
          </span>
          <span className="font-mono text-[9px] text-[#141414]/70 mt-1 block">
            FABRICATION PROBABILITY
          </span>
        </div>

        <div className="p-3 border border-[#141414] bg-white">
          <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
            Verbatim N-Grams
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414] mt-1 block">
            {metrics.verbatimScore}%
          </span>
          <span className="font-mono text-[9px] text-[#141414]/70 mt-1 block">
            {metrics.verbatimPhraseCount} CONSECUTIVE MATCHES
          </span>
        </div>

        <div className="p-3 border border-[#141414] bg-white">
          <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
            Entities In Source
          </span>
          <span className="text-2xl font-mono font-bold text-[#141414] mt-1 block">
            {metrics.entities.groundedInOutput.length}/{metrics.entities.groundedInOutput.length + metrics.entities.novelInOutput.length}
          </span>
          <span className="font-mono text-[9px] text-[#141414]/70 mt-1 block">
            {metrics.entities.novelInOutput.length} NOVEL PHANTOMS
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border border-[#141414] bg-[#E4E3E0] p-0.5 flex flex-wrap gap-0.5">
        <button
          type="button"
          id="tab-highlight-diff"
          onClick={() => setActiveTab("highlight")}
          className={`flex items-center space-x-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${
            activeTab === "highlight"
              ? "bg-[#141414] text-[#E4E3E0]"
              : "text-[#141414] hover:bg-white/60"
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Visual Highlight Diff</span>
        </button>
        <button
          type="button"
          id="tab-sentence-breakdown"
          onClick={() => setActiveTab("sentences")}
          className={`flex items-center space-x-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${
            activeTab === "sentences"
              ? "bg-[#141414] text-[#E4E3E0]"
              : "text-[#141414] hover:bg-white/60"
          }`}
        >
          <ListFilter className="w-3 h-3" />
          <span>Sentence Audit ({metrics.sentenceBreakdown.length})</span>
        </button>
        <button
          type="button"
          id="tab-entities"
          onClick={() => setActiveTab("entities")}
          className={`flex items-center space-x-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${
            activeTab === "entities"
              ? "bg-[#141414] text-[#E4E3E0]"
              : "text-[#141414] hover:bg-white/60"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Entities ({metrics.entities.groundedInOutput.length + metrics.entities.novelInOutput.length})</span>
        </button>
        {onRunAIEvaluation && (
          <button
            type="button"
            id="tab-ai-judge"
            onClick={() => setActiveTab("ai_judge")}
            className={`flex items-center space-x-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${
              activeTab === "ai_judge"
                ? "bg-[#141414] text-[#E4E3E0]"
                : "text-[#141414] hover:bg-white/60"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Fact-Check Judge</span>
            {aiEvaluation && (
              <span className="w-1.5 h-1.5 bg-emerald-400 inline-block ml-1" />
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Visual Highlighting Diff */}
      {activeTab === "highlight" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#141414] p-2.5 border border-[#141414] bg-[#F5F5F3]">
            <span className="uppercase font-bold opacity-60">LEGEND:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-300 border border-[#141414] inline-block" />
              <span>Verbatim quote (3+ consecutive context words)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-teal-200 border border-[#141414] inline-block" />
              <span>Grounded in context</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-300 border border-[#141414] inline-block" />
              <span className="font-bold text-rose-700">Suspected hallucination / novel entity</span>
            </span>
          </div>

          <div className="p-4 bg-white border border-[#141414] font-mono text-xs leading-relaxed text-[#141414]">
            {metrics.highlightTokens.map((token, i) => {
              if (token.type === "verbatim") {
                return (
                  <span
                    key={i}
                    className="bg-emerald-200 text-emerald-950 font-bold px-1 border border-emerald-400"
                    title="Verbatim match from context"
                  >
                    {token.text}
                  </span>
                );
              }
              if (token.type === "grounded") {
                return (
                  <span
                    key={i}
                    className="bg-teal-100 text-teal-950 px-0.5 border-b border-teal-500"
                    title="Found in context"
                  >
                    {token.text}
                  </span>
                );
              }
              if (token.type === "hallucination") {
                return (
                  <span
                    key={i}
                    className="bg-rose-200 text-rose-950 border border-rose-600 font-bold px-1"
                    title="Unsupported novel entity / potential hallucination"
                  >
                    {token.text}
                  </span>
                );
              }
              return <span key={i}>{token.text}</span>;
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Sentence Breakdown */}
      {activeTab === "sentences" && (
        <div className="space-y-2">
          <p className="font-serif italic text-xs text-[#141414]/70">
            Each sentence in the model output is individually scanned against the ground truth context.
          </p>

          <div className="space-y-2">
            {metrics.sentenceBreakdown.map((s) => {
              const isExpanded = expandedSentenceId === s.id;
              const statusConfig = {
                grounded: {
                  badge: "Grounded",
                  color: "bg-emerald-100 text-emerald-900 border-emerald-400",
                },
                partial: {
                  badge: "Partial",
                  color: "bg-amber-100 text-amber-900 border-amber-400",
                },
                hallucination: {
                  badge: "Hallucination",
                  color: "bg-rose-100 text-rose-900 border-rose-400 font-bold",
                },
              }[s.status];

              return (
                <div
                  key={s.id}
                  className="p-3 border border-[#141414] bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold border ${statusConfig.color}`}>
                          {statusConfig.badge}
                        </span>
                        <span className="text-[10px] text-[#141414]/70 font-mono">
                          {s.overlapScore}% overlap
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[#141414] leading-relaxed">
                        "{s.text}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedSentenceId(isExpanded ? null : s.id)}
                      className="border border-[#141414] p-1 text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-[9px] uppercase font-bold flex items-center gap-0.5"
                      title={isExpanded ? "Collapse" : "Expand context match"}
                    >
                      {isExpanded ? <span>LESS</span> : <span>EVIDENCE</span>}
                    </button>
                  </div>

                  <p className="font-serif italic text-xs text-[#141414]/70 mt-1.5">
                    {s.explanation}
                  </p>

                  {isExpanded && s.matchedContextSnippet && (
                    <div className="mt-2 p-2 bg-[#F5F5F3] border border-[#141414] font-mono text-[10px]">
                      <span className="uppercase font-bold text-[9px] opacity-60 block mb-0.5">
                        Matched Source Context Segment:
                      </span>
                      <p className="text-[#141414]">
                        "{s.matchedContextSnippet}"
                      </p>
                    </div>
                  )}

                  {s.novelEntities.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="uppercase font-bold text-[9px] text-rose-600 font-mono">
                        Novel Entities:
                      </span>
                      {s.novelEntities.map((ent, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-100 text-rose-900 border border-rose-400"
                        >
                          {ent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Entity Inventory */}
      {activeTab === "entities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Grounded Entities */}
          <div className="p-3.5 border border-[#141414] bg-white space-y-2">
            <h4 className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              Verified Grounded Entities ({metrics.entities.groundedInOutput.length})
            </h4>
            <p className="font-serif italic text-xs text-[#141414]/70">
              Identified numbers, dates, and proper names matching source context.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {metrics.entities.groundedInOutput.length > 0 ? (
                metrics.entities.groundedInOutput.map((ent, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 font-mono text-[10px] bg-emerald-100 text-emerald-950 border border-emerald-400"
                  >
                    {ent}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[10px] text-[#141414]/50 italic">No recognized entities</span>
              )}
            </div>
          </div>

          {/* Novel Unsupported Entities */}
          <div className="p-3.5 border border-[#141414] bg-[#F5F5F3] space-y-2">
            <h4 className="uppercase font-bold text-[10px] tracking-widest text-rose-700">
              Unsupported Novel Entities ({metrics.entities.novelInOutput.length})
            </h4>
            <p className="font-serif italic text-xs text-[#141414]/70">
              Introduced claims or phantom metrics not substantiated by the reference context.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {metrics.entities.novelInOutput.length > 0 ? (
                metrics.entities.novelInOutput.map((ent, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 font-mono text-[10px] font-bold bg-rose-100 text-rose-950 border border-rose-500"
                  >
                    {ent}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[10px] text-emerald-800 font-bold">
                  ZERO_NOVEL_ENTITIES_DETECTED
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Judge Fact-Check */}
      {activeTab === "ai_judge" && onRunAIEvaluation && (
        <div className="space-y-3">
          {!aiEvaluation ? (
            <div className="p-5 text-center border border-[#141414] bg-white space-y-2.5">
              <h4 className="uppercase font-bold text-[10px] tracking-widest text-[#141414]">
                Semantic Claim Verification via Gemini 3.8 Flash
              </h4>
              <p className="font-serif italic text-xs text-[#141414]/70 max-w-md mx-auto">
                Executes deep multi-step semantic verification of each claim against the context document.
              </p>
              <button
                type="button"
                id="btn-run-ai-eval"
                onClick={onRunAIEvaluation}
                disabled={isAIEvaluationLoading}
                className="border border-[#141414] bg-[#141414] text-white px-5 py-2 font-bold uppercase tracking-wider text-[10px] hover:bg-[#141414]/90 transition-colors disabled:opacity-50"
              >
                {isAIEvaluationLoading ? "Evaluating claims with AI..." : "06 RUN AI FACT-CHECK JUDGE"}
              </button>
            </div>
          ) : (
            <div className="p-4 border border-[#141414] bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141414]/15 pb-2">
                <div>
                  <span className="uppercase font-bold text-[9px] opacity-60 tracking-widest block">
                    AI Judge Verdict
                  </span>
                  <h4 className="font-mono text-sm font-bold text-[#141414]">{aiEvaluation.verdict}</h4>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div>
                    <span className="opacity-60 text-[9px] block">AI GROUNDED</span>
                    <span className="font-bold">{aiEvaluation.groundednessScore}%</span>
                  </div>
                  <div>
                    <span className="opacity-60 text-[9px] block">AI HALLUCINATION</span>
                    <span className="font-bold text-rose-600">{aiEvaluation.hallucinationScore}%</span>
                  </div>
                </div>
              </div>

              <p className="font-serif italic text-xs text-[#141414] p-2.5 bg-[#F5F5F3] border border-[#141414]/20 leading-relaxed">
                {aiEvaluation.reasoning}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 border border-[#141414] bg-white">
                  <span className="uppercase font-bold text-[9px] text-emerald-800 tracking-wider block mb-1">
                    Verified Supported Claims ({aiEvaluation.supportedClaims.length})
                  </span>
                  <ul className="font-mono text-[10px] text-[#141414]/80 space-y-1 list-disc pl-4">
                    {aiEvaluation.supportedClaims.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 border border-[#141414] bg-white">
                  <span className="uppercase font-bold text-[9px] text-rose-700 tracking-wider block mb-1">
                    Unsupported Claims ({aiEvaluation.unsupportedClaims.length})
                  </span>
                  {aiEvaluation.unsupportedClaims.length > 0 ? (
                    <ul className="font-mono text-[10px] text-[#141414]/80 space-y-1 list-disc pl-4">
                      {aiEvaluation.unsupportedClaims.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="font-mono text-[10px] text-emerald-700 font-bold">None detected by judge.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-[#141414]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#141414] max-w-md w-full p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#141414] pb-2">
              <h3 className="font-bold uppercase tracking-wider text-xs text-[#141414]">
                Save Test To Leaderboard
              </h3>
              <span className="font-mono text-[9px] opacity-60">ID: RUN_{Date.now().toString().slice(-6)}</span>
            </div>

            <p className="font-serif italic text-xs text-[#141414]/70">
              Record this benchmark run for <strong className="text-[#141414] font-mono">{modelName || "Unnamed Model"}</strong> to the persistent rankings table.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="save-notes-input" className="uppercase font-bold text-[9px] opacity-60 block">
                Experimental Notes / Parameter Tag
              </label>
              <input
                id="save-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Temperature 0.2, Top-p 0.9, Zero-shot prompt..."
                className="w-full p-2 text-xs font-mono bg-white border border-[#141414] outline-none focus:ring-1 focus:ring-[#141414]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#141414]/20">
              <button
                type="button"
                id="btn-cancel-save"
                onClick={() => setShowSaveModal(false)}
                className="border border-[#141414] bg-white px-3 py-1 text-[10px] uppercase font-bold hover:bg-[#F5F5F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-save"
                onClick={handleSave}
                className="border border-[#141414] bg-[#141414] text-white px-4 py-1 text-[10px] uppercase font-bold hover:bg-[#141414]/90"
              >
                Confirm &amp; Record Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
