import React, { useState } from "react";
import {
  Copy,
  Check,
  ClipboardPaste,
  Play,
  FileText,
  MessageSquare,
  Bot,
  Zap,
  Sparkles,
  Info,
  Code2,
  Trash2,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { looksLikeCode } from "../utils/hallucinationEvaluator";
import { EvaluationMode } from "../types";

interface BenchmarkInputProps {
  modelName: string;
  setModelName: (val: string) => void;
  context: string;
  setContext: (val: string) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  modelOutput: string;
  setModelOutput: (val: string) => void;
  onEvaluate: () => void;
  onRunGemini: () => Promise<void>;
  isGeminiLoading: boolean;
  onShowToast: (msg: string, type?: "success" | "info" | "error") => void;
  evalMode: EvaluationMode;
  setEvalMode: (mode: EvaluationMode) => void;
  onStartCustomBlank: () => void;
  onLoadCodePreset: () => void;
  onOpenPresets: () => void;
  onClearAll: () => void;
  activePresetTitle: string;
}

const COMMON_MODELS = [
  "GPT-4o",
  "Claude 3.5 Sonnet",
  "Gemini 3.8 Flash",
  "Llama 3.3 70B",
  "DeepSeek-V3",
  "Mistral Large",
];

export const BenchmarkInput: React.FC<BenchmarkInputProps> = ({
  modelName,
  setModelName,
  context,
  setContext,
  prompt,
  setPrompt,
  modelOutput,
  setModelOutput,
  onEvaluate,
  onRunGemini,
  isGeminiLoading,
  onShowToast,
  evalMode,
  setEvalMode,
  onStartCustomBlank,
  onLoadCodePreset,
  onOpenPresets,
  onClearAll,
  activePresetTitle,
}) => {
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCombined, setCopiedCombined] = useState(false);

  const handleCopyContext = async () => {
    if (!context.trim()) {
      onShowToast("Context is empty. Enter or load context first.", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(context);
      setCopiedContext(true);
      onShowToast("Context copied to clipboard!", "success");
      setTimeout(() => setCopiedContext(false), 2000);
    } catch {
      onShowToast("Unable to copy context automatically.", "error");
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt.trim()) {
      onShowToast("Prompt is empty. Enter a prompt first.", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      onShowToast("Prompt copied to clipboard!", "success");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      onShowToast("Unable to copy prompt automatically.", "error");
    }
  };

  const handleCopyCombined = async () => {
    if (!context.trim() && !prompt.trim()) {
      onShowToast("Both context and prompt are empty.", "info");
      return;
    }
    const combined = `[CONTEXT]
${context}

[PROMPT / QUESTION]
${prompt}

[INSTRUCTION]
Answer strictly using facts provided in the Context above. If the context does not contain the answer, explicitly say 'Not mentioned in context'. Do NOT fabricate or assume details.`;

    try {
      await navigator.clipboard.writeText(combined);
      setCopiedCombined(true);
      onShowToast("Context + Prompt formatted and copied for your AI model!", "success");
      setTimeout(() => setCopiedCombined(false), 2000);
    } catch {
      onShowToast("Unable to copy combined prompt automatically.", "error");
    }
  };

  const handlePasteOutput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setModelOutput(text);
        onShowToast("Pasted model output from clipboard!", "success");
      } else {
        onShowToast("Clipboard appears to be empty.", "info");
      }
    } catch {
      onShowToast("Clipboard access denied. Please paste directly into the box.", "info");
    }
  };

  const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
  const lineCount = (text: string) => (text.trim() ? text.trim().split(/\r?\n/).length : 0);

  const contextIsCode = looksLikeCode(context);
  const outputIsCode = looksLikeCode(modelOutput);

  // Live matching verification
  const isExactIdentical = Boolean(
    context.trim() &&
    modelOutput.trim() &&
    context.trim() === modelOutput.trim()
  );

  const isDirectSubstring = Boolean(
    !isExactIdentical &&
    context.trim() &&
    modelOutput.trim() &&
    context.includes(modelOutput.trim())
  );

  return (
    <div className="space-y-4">
      {/* Workspace Controls & Mode Selector Toolbar */}
      <div className="bg-[#D9D8D5] p-3 border border-[#141414] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="uppercase font-bold text-[10px] tracking-widest opacity-70 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Audit Mode:
          </span>
          <div className="flex items-center border border-[#141414] bg-[#E4E3E0] p-0.5">
            <button
              type="button"
              id="mode-standard"
              onClick={() => {
                setEvalMode("standard");
                onShowToast("Standard Grounding Mode: analyzes facts, entities & hallucination traps.", "info");
              }}
              className={`px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors ${
                evalMode === "standard"
                  ? "bg-[#141414] text-[#E4E3E0]"
                  : "text-[#141414] hover:bg-white/60"
              }`}
            >
              ⚡ Standard Audit
            </button>
            <button
              type="button"
              id="mode-verbatim"
              onClick={() => {
                setEvalMode("strict_verbatim");
                onShowToast("Strict Verbatim Mode: verifies exact code & string fidelity.", "info");
              }}
              className={`px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors ${
                evalMode === "strict_verbatim"
                  ? "bg-[#141414] text-[#E4E3E0]"
                  : "text-[#141414] hover:bg-white/60"
              }`}
            >
              🔍 Strict Verbatim Fidelity
            </button>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            id="btn-custom-blank"
            onClick={onStartCustomBlank}
            className="border border-[#141414] bg-white px-3 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1 shadow-none"
            title="Clear inputs and enter your own context and prompt"
          >
            <span>+ Enter Own Context &amp; Prompt</span>
          </button>

          <button
            type="button"
            id="btn-load-code-preset"
            onClick={onLoadCodePreset}
            className="border border-[#141414] bg-white px-3 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1"
            title="Load a code verbatim test scenario"
          >
            <Code2 className="w-3 h-3" />
            <span>Code Verbatim Test</span>
          </button>

          <button
            type="button"
            id="btn-browse-presets-bar"
            onClick={onOpenPresets}
            className="border border-[#141414] bg-white px-3 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1"
            title="Browse standard evaluation benchmarks"
          >
            <BookOpen className="w-3 h-3" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            id="btn-clear-all"
            onClick={onClearAll}
            className="border border-[#141414] bg-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-rose-950 hover:text-white transition-colors flex items-center gap-1 text-rose-700"
            title="Clear all fields"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 01 Model Identity Card */}
      <div className="bg-white p-4 border border-[#141414] flex flex-col gap-2.5 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              01 Model Identity &amp; Architecture
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#141414]/70">
            TARGET_NODE: {modelName ? modelName.toUpperCase().replace(/[\s.]+/g, "_") : "UNSET"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="model-name-input"
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., Claude-3-5-Sonnet, GPT-4o, Gemini-3.8-Flash, Custom..."
            className="flex-1 bg-white border border-[#141414] p-2 font-mono text-xs outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
          />
        </div>

        {/* Quick model selector pills */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-[#141414]/15">
          <span className="uppercase font-bold text-[9px] opacity-60 mr-1">Quick Select:</span>
          {COMMON_MODELS.map((name) => (
            <button
              key={name}
              type="button"
              id={`quick-model-${name.toLowerCase().replace(/[\s.]+/g, "-")}`}
              onClick={() => setModelName(name)}
              className={`text-[9px] uppercase font-mono px-2 py-0.5 border transition-colors ${
                modelName === name
                  ? "bg-[#141414] text-white border-[#141414] font-bold"
                  : "bg-white text-[#141414] border-[#141414]/40 hover:border-[#141414] hover:bg-[#F5F5F3]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 02 Context & 03 Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 02 Source Context Card */}
        <div className="bg-white p-4 border border-[#141414] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="context-input" className="uppercase font-bold text-[10px] tracking-widest opacity-60">
                02 Ground Truth Context / Source Code
              </label>
              {contextIsCode && (
                <span className="font-mono text-[9px] bg-[#E4E3E0] border border-[#141414] px-1 py-0.2 uppercase font-bold">
                  Code Detected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[#141414]/70">
                {wordCount(context)} words • {lineCount(context)} lines
              </span>
              <button
                type="button"
                id="btn-copy-context"
                onClick={handleCopyContext}
                className="border border-[#141414] bg-white px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1"
                title="Copy Context to Clipboard"
              >
                {copiedContext ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPY CONTEXT</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/70">
            Paste source documents, factual references, or original code that the response must strictly reproduce or adhere to.
          </p>
          <textarea
            id="context-input"
            rows={7}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste your source context, documentation, or code here..."
            className="w-full flex-1 bg-white border border-[#141414] p-2.5 font-mono text-[11px] leading-relaxed resize-y outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
          />
        </div>

        {/* 03 Input Prompt Card */}
        <div className="bg-[#D9D8D5] p-4 border border-[#141414] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="prompt-input" className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              03 Input Prompt
            </label>
            <button
              type="button"
              id="btn-copy-prompt"
              onClick={handleCopyPrompt}
              className="bg-[#141414] text-[#E4E3E0] px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1"
              title="Copy Prompt only"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY PROMPT</span>
                </>
              )}
            </button>
          </div>
          <p className="font-serif italic text-xs text-[#141414]/70">
            The query, command, or instruction presented to the AI system under test.
          </p>
          <textarea
            id="prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Extract exact code from context, or answer the question strictly according to context facts..."
            className="w-full flex-1 bg-white/70 border border-[#141414] p-2.5 font-mono text-[11px] leading-relaxed resize-y outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
          />

          {/* Quick Chat-Ready Pack and Telemetry */}
          <div className="p-2 border border-[#141414] border-dashed flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#E4E3E0]">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold">
              <span>Token Estimate:</span>
              <span className="font-mono text-[#141414]/80">
                {Math.round((context.length + prompt.length) / 4)} TOKENS
              </span>
            </div>
            <button
              type="button"
              id="btn-copy-combined"
              onClick={handleCopyCombined}
              className="w-full sm:w-auto bg-[#141414] text-[#E4E3E0] px-3 py-1 text-[9px] uppercase font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              {copiedCombined ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>COPIED ALL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY PROMPT + CONTEXT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 04 Model Output Box */}
      <div className="bg-white p-4 border border-[#141414] flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="model-output-input" className="uppercase font-bold text-[10px] tracking-widest opacity-60">
              04 Model Output
            </label>
            {outputIsCode && (
              <span className="font-mono text-[9px] bg-[#E4E3E0] border border-[#141414] px-1 py-0.2 uppercase font-bold">
                Code Detected
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-[9px] text-[#141414]/70 mr-1">
              {wordCount(modelOutput)} words • {lineCount(modelOutput)} lines
            </span>
            <button
              type="button"
              id="btn-paste-output"
              onClick={handlePasteOutput}
              className="border border-[#141414] bg-white px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center gap-1"
              title="Paste clipboard into this field"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>PASTE CLIPBOARD</span>
            </button>
            <button
              type="button"
              id="btn-run-gemini"
              onClick={onRunGemini}
              disabled={isGeminiLoading || !prompt.trim()}
              className="border border-[#141414] bg-[#E4E3E0] px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              title="Auto-run benchmark with Gemini 3.8 Flash"
            >
              <Sparkles className="w-3 h-3 text-[#141414]" />
              <span>{isGeminiLoading ? "RUNNING_GEMINI..." : "AUTO_RUN_GEMINI"}</span>
            </button>
          </div>
        </div>

        {/* Live Match Notification Banner */}
        {isExactIdentical && (
          <div className="p-2 border border-emerald-600 bg-emerald-50 text-emerald-950 font-mono text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              EXACT 100% IDENTICAL MATCH WITH CONTEXT DETECTED!
            </span>
            <span className="text-emerald-800 text-[10px]">
              (Zero hallucination — click Run Audit below to verify 100% Grounding score)
            </span>
          </div>
        )}

        {isDirectSubstring && (
          <div className="p-2 border border-blue-600 bg-blue-50 text-blue-950 font-mono text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold">
              VERBATIM SUBSTRING MATCH DETECTED!
            </span>
            <span className="text-blue-800 text-[10px]">
              (All characters exist directly in source context)
            </span>
          </div>
        )}

        <p className="font-serif italic text-xs text-[#141414]/70">
          Paste the target LLM response or code to compute factual grounding, check verbatim overlap, and isolate hallucinations.
        </p>

        <textarea
          id="model-output-input"
          rows={6}
          value={modelOutput}
          onChange={(e) => setModelOutput(e.target.value)}
          placeholder="Paste model output or code here to score..."
          className="w-full bg-white border border-[#141414] p-3 font-mono text-[11px] leading-relaxed resize-y outline-none focus:ring-1 focus:ring-[#141414] text-[#141414]"
        />

        {/* Primary Evaluation CTA Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#141414]/15">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#141414]/70">
            <span className="w-1.5 h-1.5 bg-[#141414]"></span>
            <span>
              MODE: {evalMode === "strict_verbatim" ? "STRICT VERBATIM & EXACT CODE FIDELITY" : "STANDARD GROUNDING & ENTITY CHECK"}
            </span>
          </div>

          <button
            type="button"
            id="btn-evaluate"
            onClick={onEvaluate}
            disabled={!modelOutput.trim()}
            className="border border-[#141414] bg-[#141414] text-white px-6 py-2.5 font-bold uppercase tracking-wider text-xs hover:bg-[#141414]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>
              {evalMode === "strict_verbatim"
                ? "05 RUN VERBATIM AUDIT & VERIFY FIDELITY"
                : "05 RUN AUDIT & CALCULATE SCORE"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
