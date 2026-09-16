import React, { useState } from "react";
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ClipboardPaste,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  FileCode,
  ShieldCheck,
  Check,
  Zap,
} from "lucide-react";
import { EvaluationMetrics } from "../types";
import { stripCodeFences, looksLikeCode, stringSimilarity } from "../utils/hallucinationEvaluator";

interface VerbatimDiffPageProps {
  context: string;
  setContext: (val: string) => void;
  modelOutput: string;
  setModelOutput: (val: string) => void;
  metrics: EvaluationMetrics | null;
  onRunAudit: () => void;
  onSaveToLeaderboard: () => void;
  onShowToast: (msg: string, type?: "success" | "info" | "error") => void;
}

const SAMPLE_CODE_SNIPPET = `// Payment reconciliation module
export interface Transaction {
  id: string;
  amountCents: number;
  currency: "USD" | "EUR" | "GBP";
  status: "settled" | "pending" | "refunded";
  timestamp: number;
}

export function reconcileBatch(transactions: Transaction[]): {
  totalSettledAmount: number;
  settledCount: number;
  pendingCount: number;
} {
  let total = 0;
  let settled = 0;
  let pending = 0;

  for (const tx of transactions) {
    if (tx.status === "settled") {
      total += tx.amountCents;
      settled++;
    } else if (tx.status === "pending") {
      pending++;
    }
  }

  return { totalSettledAmount: total, settledCount: settled, pendingCount: pending };
}`;

export const VerbatimDiffPage: React.FC<VerbatimDiffPageProps> = ({
  context,
  setContext,
  modelOutput,
  setModelOutput,
  metrics,
  onRunAudit,
  onSaveToLeaderboard,
  onShowToast,
}) => {
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [showFencesStripped, setShowFencesStripped] = useState(true);

  // Quick action: load sample code
  const handleLoadSample = () => {
    setContext(SAMPLE_CODE_SNIPPET);
    setModelOutput(SAMPLE_CODE_SNIPPET);
    onShowToast("Sample code loaded into both source and output. Ready for audit!", "info");
  };

  // Quick action: paste into output
  const handlePasteOutput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setModelOutput(text);
        onShowToast("Pasted text from clipboard into Evaluated Output!", "success");
      } else {
        onShowToast("Clipboard is empty.", "info");
      }
    } catch {
      onShowToast("Please paste directly into the textarea.", "info");
    }
  };

  // Quick action: copy output
  const handleCopyOutput = async () => {
    if (!modelOutput) return;
    try {
      await navigator.clipboard.writeText(modelOutput);
      setCopiedOutput(true);
      onShowToast("Copied output to clipboard!", "success");
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      onShowToast("Failed to copy automatically.", "error");
    }
  };

  // Quick action: copy context
  const handleCopyContext = async () => {
    if (!context) return;
    try {
      await navigator.clipboard.writeText(context);
      setCopiedContext(true);
      onShowToast("Copied context to clipboard!", "success");
      setTimeout(() => setCopiedContext(false), 2000);
    } catch {
      onShowToast("Failed to copy context.", "error");
    }
  };

  // Quick action: copy identical context to output
  const handleCopyContextToOutput = () => {
    if (!context.trim()) {
      onShowToast("Source context is empty.", "info");
      return;
    }
    setModelOutput(context);
    onShowToast("Copied source context directly into Evaluated Output.", "success");
  };

  // Quick action: strip markdown backticks from output
  const handleStripFences = () => {
    const strippedContext = stripCodeFences(context);
    const strippedOutput = stripCodeFences(modelOutput);
    setContext(strippedContext);
    setModelOutput(strippedOutput);
    onShowToast("Stripped markdown code fences (```) from both fields.", "success");
  };

  // Live match diagnostics
  const cleanCtx = stripCodeFences(context).trim();
  const cleanOut = stripCodeFences(modelOutput).trim();

  const isExactMatch = Boolean(cleanCtx && cleanOut && cleanCtx === cleanOut);
  const isSubstring = Boolean(!isExactMatch && cleanCtx && cleanOut && cleanCtx.includes(cleanOut));

  // Quick line stats
  const contextLines = cleanCtx ? cleanCtx.split(/\r?\n/) : [];
  const outputLines = cleanOut ? cleanOut.split(/\r?\n/) : [];

  return (
    <div className="space-y-6">
      {/* Overview & Quick Toolbar */}
      <div className="bg-white border border-[#141414] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-[#141414]" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#141414]">
              Verbatim Code &amp; Precision Diff Inspector
            </h2>
            <span className="font-mono text-[9px] px-2 py-0.5 border border-[#141414] bg-[#E4E3E0] font-bold uppercase">
              Zero-False-Positive Engine
            </span>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/75 mt-1">
            Compare source code or reference text against an AI response. Inspects exact line matches, token overlap, and code syntax without penalizing code identifiers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            id="btn-diff-load-sample"
            onClick={handleLoadSample}
            className="border border-[#141414] bg-[#E4E3E0] hover:bg-[#141414] hover:text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors flex items-center gap-1.5"
            title="Load sample TypeScript module"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Load Code Sample</span>
          </button>

          <button
            type="button"
            id="btn-diff-copy-to-output"
            onClick={handleCopyContextToOutput}
            className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors flex items-center gap-1.5"
            title="Duplicate Context into Output to verify 100% score"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Mirror to Output</span>
          </button>

          <button
            type="button"
            id="btn-diff-strip-fences"
            onClick={handleStripFences}
            className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors flex items-center gap-1.5"
            title="Strip ``` markdown fences if present"
          >
            <span>Strip Fences (```)</span>
          </button>

          <button
            type="button"
            id="btn-diff-clear"
            onClick={() => {
              setContext("");
              setModelOutput("");
              onShowToast("Cleared diff editor fields.", "info");
            }}
            className="border border-[#141414] bg-white hover:bg-rose-900 hover:text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors flex items-center gap-1 text-rose-700"
            title="Clear fields"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Exact Match Status Banner */}
      {isExactMatch && (
        <div className="p-3.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                100% Exact Verbatim Match Confirmed
              </span>
              <p className="font-serif italic text-xs text-emerald-800">
                The evaluated code is an exact, character-for-character reproduction of the reference context. Zero hallucination risk detected.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="font-mono text-[10px] bg-emerald-600 text-white px-2.5 py-1 font-bold uppercase">
              100% GROUNDED
            </span>
          </div>
        </div>
      )}

      {isSubstring && (
        <div className="p-3 border border-blue-600 bg-blue-50 text-blue-950 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Verbatim Substring Verified
            </span>
            <span className="font-serif italic text-xs text-blue-800">
              — All lines in the evaluated output exist verbatim in the ground truth context.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-blue-600 text-white px-2 py-0.5 font-bold uppercase">
            100% GROUNDED
          </span>
        </div>
      )}

      {/* Dual Side-by-Side Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Context / Reference */}
        <div className="bg-white border border-[#141414] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141414]">
                Source Ground Truth / Reference Code
              </span>
              {looksLikeCode(context) && (
                <span className="font-mono text-[9px] bg-[#E4E3E0] px-1.5 py-0.2 uppercase font-bold border border-[#141414]">
                  Code
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-[#141414]/70">
                {contextLines.length} lines
              </span>
              <button
                type="button"
                onClick={handleCopyContext}
                className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white text-[9px] uppercase font-bold px-2 py-0.5 transition-colors flex items-center gap-1"
                title="Copy context to clipboard"
              >
                {copiedContext ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedContext ? "COPIED" : "COPY"}</span>
              </button>
            </div>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/70">
            The canonical source code, function signature, or factual text to verify against.
          </p>
          <textarea
            id="diff-source-context"
            rows={12}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste source code or text here..."
            className="w-full bg-[#F5F5F3] border border-[#141414] p-3 font-mono text-[11px] leading-relaxed resize-y outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
          />
        </div>

        {/* Evaluated Output / AI Result */}
        <div className="bg-white border border-[#141414] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141414]">
                Evaluated Output / Model Generation
              </span>
              {looksLikeCode(modelOutput) && (
                <span className="font-mono text-[9px] bg-[#E4E3E0] px-1.5 py-0.2 uppercase font-bold border border-[#141414]">
                  Code
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] text-[#141414]/70">
                {outputLines.length} lines
              </span>
              <button
                type="button"
                onClick={handlePasteOutput}
                className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white text-[9px] uppercase font-bold px-2 py-0.5 transition-colors flex items-center gap-1"
                title="Paste clipboard into output"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>PASTE</span>
              </button>
              <button
                type="button"
                onClick={handleCopyOutput}
                className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white text-[9px] uppercase font-bold px-2 py-0.5 transition-colors flex items-center gap-1"
                title="Copy output to clipboard"
              >
                {copiedOutput ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedOutput ? "COPIED" : "COPY"}</span>
              </button>
            </div>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/70">
            The output produced by the LLM to audit for hallucinations or missing code.
          </p>
          <textarea
            id="diff-model-output"
            rows={12}
            value={modelOutput}
            onChange={(e) => setModelOutput(e.target.value)}
            placeholder="Paste model output or code here..."
            className="w-full bg-[#F5F5F3] border border-[#141414] p-3 font-mono text-[11px] leading-relaxed resize-y outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
          />
        </div>
      </div>

      {/* Run Audit CTA & Primary Scores */}
      <div className="bg-[#E4E3E0] border border-[#141414] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
              GROUNDEDNESS SCORE
            </span>
            <span className="font-mono text-2xl font-bold text-[#141414]">
              {metrics ? `${metrics.groundednessScore}%` : isExactMatch ? "100%" : "—"}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-[#141414]/20 hidden sm:block"></div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
              VERBATIM ACCURACY
            </span>
            <span className="font-mono text-2xl font-bold text-[#141414]">
              {metrics ? `${metrics.verbatimScore}%` : isExactMatch ? "100%" : "—"}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-[#141414]/20 hidden sm:block"></div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
              HALLUCINATION RISK
            </span>
            <span className={`font-mono text-2xl font-bold ${
              metrics && metrics.hallucinationScore > 0 ? "text-rose-700" : "text-emerald-700"
            }`}>
              {metrics ? `${metrics.hallucinationScore}%` : isExactMatch ? "0%" : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metrics && (
            <button
              type="button"
              id="btn-diff-save-leaderboard"
              onClick={onSaveToLeaderboard}
              className="border border-[#141414] bg-white hover:bg-[#141414] hover:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Save to Leaderboard
            </button>
          )}

          <button
            type="button"
            id="btn-run-diff-audit"
            onClick={onRunAudit}
            disabled={!modelOutput.trim()}
            className="border border-[#141414] bg-[#141414] hover:bg-[#141414]/90 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>RUN PRECISION DIFF AUDIT</span>
          </button>
        </div>
      </div>

      {/* Visual Line-by-Line Diff Breakdown */}
      {metrics && metrics.lineDiffs && metrics.lineDiffs.length > 0 && (
        <div className="bg-white border border-[#141414] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141414]/15 pb-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                Line-by-Line Visual Diff &amp; Verification
              </span>
              <p className="font-serif italic text-xs text-[#141414]/70">
                Green indicates verified ground truth match. Amber indicates modified phrasing or expression. Red indicates novel/unsupported code.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 inline-block border border-[#141414]"></span>
                Exact ({metrics.lineDiffs.filter((d) => d.status === "match").length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-400 inline-block border border-[#141414]"></span>
                Modified ({metrics.lineDiffs.filter((d) => d.status === "modified").length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 inline-block border border-[#141414]"></span>
                Novel ({metrics.lineDiffs.filter((d) => d.status === "novel").length})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#141414]">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#E4E3E0] border-b border-[#141414] uppercase text-[10px] tracking-wider text-[#141414]">
                  <th className="p-2 border-r border-[#141414] w-12 text-center">Line</th>
                  <th className="p-2 border-r border-[#141414] w-1/2">Source Ground Truth</th>
                  <th className="p-2 border-r border-[#141414] w-1/2">Evaluated Output</th>
                  <th className="p-2 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lineDiffs.map((diff) => {
                  let rowBg = "bg-white";
                  let badge = (
                    <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-600">
                      MATCH 100%
                    </span>
                  );

                  if (diff.status === "modified") {
                    rowBg = "bg-amber-50/50";
                    badge = (
                      <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-600">
                        {diff.similarity}% SIMILAR
                      </span>
                    );
                  } else if (diff.status === "novel") {
                    rowBg = "bg-rose-50/60";
                    badge = (
                      <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-rose-100 text-rose-800 border border-rose-600">
                        UNGROUNDED
                      </span>
                    );
                  } else if (diff.status === "empty") {
                    rowBg = "bg-neutral-50";
                    badge = (
                      <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-neutral-200 text-neutral-700 border border-neutral-400">
                        OMITTED
                      </span>
                    );
                  }

                  return (
                    <tr key={diff.lineNumber} className={`border-b border-[#141414]/10 ${rowBg}`}>
                      <td className="p-2 text-center text-[#141414]/50 border-r border-[#141414]/15 select-none font-bold">
                        {diff.lineNumber}
                      </td>
                      <td className="p-2 border-r border-[#141414]/15 whitespace-pre-wrap break-all text-[#141414]">
                        {diff.contextLine !== undefined ? diff.contextLine : <span className="opacity-30 italic">(none)</span>}
                      </td>
                      <td className="p-2 border-r border-[#141414]/15 whitespace-pre-wrap break-all text-[#141414]">
                        {diff.outputLine !== undefined ? diff.outputLine : <span className="opacity-30 italic">(omitted in output)</span>}
                      </td>
                      <td className="p-2 text-center whitespace-nowrap">
                        {badge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
