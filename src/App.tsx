/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { BenchmarkInput } from "./components/BenchmarkInput";
import { ScoreDashboard } from "./components/ScoreDashboard";
import { Leaderboard } from "./components/Leaderboard";
import { AuditModal } from "./components/AuditModal";
import { PresetSelectorModal } from "./components/PresetSelectorModal";
import { VerbatimDiffPage } from "./components/VerbatimDiffPage";
import { AuditDeepDivePage } from "./components/AuditDeepDivePage";
import { TheBenchiesLanding } from "./components/TheBenchiesLanding";
import { Toast, ToastMessage } from "./components/Toast";
import { BENCHMARK_PRESETS } from "./data/benchmarkPresets";
import { getInitialLeaderboard } from "./data/seedLeaderboard";
import { evaluateHallucination } from "./utils/hallucinationEvaluator";
import {
  EvaluationMetrics,
  LeaderboardEntry,
  BenchmarkPreset,
  AIEvaluationResult,
  EvaluationMode,
  ActiveTab,
} from "./types";
import {
  Code2,
  Sparkles,
  FileCheck2,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "hallucination_benchmark_leaderboard_v2";

export default function App() {
  const defaultPreset = BENCHMARK_PRESETS[0];

  // Primary Workspace State
  const [modelName, setModelName] = useState<string>("Claude 3.5 Sonnet");
  const [context, setContext] = useState<string>(defaultPreset.context);
  const [prompt, setPrompt] = useState<string>(defaultPreset.prompt);
  const [modelOutput, setModelOutput] = useState<string>("");
  const [activePresetTitle, setActivePresetTitle] = useState<string>(defaultPreset.title);
  const [evalMode, setEvalMode] = useState<EvaluationMode>("standard");

  // Multi-Page Navigation Tab: The Benchies marketing homepage by default
  const [activeTab, setActiveTab] = useState<ActiveTab>("the_benchies");

  // Evaluation & Judge State
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluationResult | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [isAIEvalLoading, setIsAIEvalLoading] = useState<boolean>(false);

  // Modals & Inspection
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [inspectingEntry, setInspectingEntry] = useState<LeaderboardEntry | null>(null);

  // Leaderboard state persisted to LocalStorage
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to read localStorage:", e);
    }
    return getInitialLeaderboard();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [leaderboard]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const scoreRef = useRef<HTMLDivElement>(null);

  // Execute Core Evaluation
  const handleEvaluate = () => {
    if (!modelOutput.trim()) {
      addToast("Please enter or paste a model output to evaluate.", "error");
      return;
    }

    const calculated = evaluateHallucination(context, prompt, modelOutput, evalMode);
    setMetrics(calculated);
    setAiEvaluation(null);

    if (calculated.verbatimStats?.exactMatch || calculated.verbatimScore === 100) {
      addToast("100% Exact Verbatim Match verified! Zero hallucination.", "success");
    } else {
      addToast(
        `Audit complete: Groundedness ${calculated.groundednessScore}%, Hallucination Risk ${calculated.hallucinationScore}%`,
        "success"
      );
    }

    // If in benchmark lab, scroll down to score
    if (activeTab === "benchmark_lab") {
      setTimeout(() => {
        scoreRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Run Gemini 3.8 Flash via backend Express API
  const handleRunGemini = async () => {
    if (!prompt.trim()) {
      addToast("Please enter a benchmark prompt first.", "info");
      return;
    }

    setIsGeminiLoading(true);
    addToast("Generating response with Gemini 3.8 Flash...", "info");

    try {
      const res = await fetch("/api/run-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context,
          model: "gemini-3.8-flash",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gemini generation failed");
      }

      setModelName("Gemini 3.8 Flash");
      setModelOutput(data.output || "");
      addToast("Response generated! Calculating groundedness scores...", "success");

      const calculated = evaluateHallucination(context, prompt, data.output || "", evalMode);
      setMetrics(calculated);
      setAiEvaluation(null);

      setTimeout(() => {
        scoreRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "Failed to run Gemini", "error");
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // AI Judge evaluation via backend Express endpoint
  const handleRunAIEvaluation = async () => {
    if (!modelOutput.trim()) {
      addToast("No model output available to judge.", "info");
      return;
    }

    setIsAIEvalLoading(true);
    addToast("Triggering deep Gemini AI Fact-Checking Judge...", "info");

    try {
      const res = await fetch("/api/evaluate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context,
          modelOutput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI Judge evaluation failed");
      }

      setAiEvaluation(data);
      if (metrics) {
        setMetrics({ ...metrics, aiAudit: data });
      }
      addToast(`AI Fact-Check complete: ${data.verdict}`, "success");
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "AI Judge evaluation error", "error");
    } finally {
      setIsAIEvalLoading(false);
    }
  };

  // Save to Leaderboard
  const handleSaveToLeaderboard = (notes: string = "") => {
    let evalToSave = metrics;
    if (!evalToSave) {
      evalToSave = evaluateHallucination(context, prompt, modelOutput, evalMode);
      setMetrics(evalToSave);
    }

    const newEntry: LeaderboardEntry = {
      id: `entry-${Date.now()}`,
      modelName: modelName.trim() || "Target Model",
      testTitle: activePresetTitle || "Custom Verification",
      promptSnippet: prompt || "(Direct Verbatim Inspection)",
      contextSnippet: context,
      modelOutput,
      metrics: evalToSave,
      timestamp: Date.now(),
      notes: notes.trim() || undefined,
    };

    setLeaderboard((prev) => [newEntry, ...prev]);
    addToast(`Saved test run to Leaderboard!`, "success");
  };

  // Preset Selection
  const handleSelectPreset = (preset: BenchmarkPreset) => {
    setActivePresetTitle(preset.title);
    setContext(preset.context);
    setPrompt(preset.prompt);
    setModelOutput("");
    setMetrics(null);
    setAiEvaluation(null);
    addToast(`Loaded preset: "${preset.title}"`, "info");
  };

  // Start with a blank custom workspace
  const handleStartCustomBlank = () => {
    setActivePresetTitle("Custom Evaluation");
    setContext("");
    setPrompt("");
    setModelOutput("");
    setMetrics(null);
    setAiEvaluation(null);
    addToast("Blank workspace opened. Enter custom context & prompt.", "info");
  };

  // Load a code verbatim benchmark test
  const handleLoadCodePreset = () => {
    setModelName("Code Verbatim Auditor");
    const sampleCode = `// Math utilities module\nexport function calculateFactorial(n: number): number {\n  if (n < 0) throw new Error("Negative numbers not allowed");\n  if (n === 0 || n === 1) return 1;\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}\n\nexport const MAX_SAFE_FACTORIAL = 170;`;
    setContext(sampleCode);
    setPrompt("Provide the exact implementation of calculateFactorial and MAX_SAFE_FACTORIAL from the module.");
    setModelOutput(sampleCode);
    setActivePresetTitle("Code Verbatim Fidelity Test");
    setEvalMode("strict_verbatim");
    setMetrics(null);
    setAiEvaluation(null);
    setActiveTab("verbatim_diff");
    addToast("Loaded Code Verbatim scenario into Diff Inspector!", "info");
  };

  // Reset Test fields
  const handleResetTest = () => {
    setModelOutput("");
    setMetrics(null);
    setAiEvaluation(null);
    addToast("Cleared test output and scores.", "info");
  };

  // Clear all fields
  const handleClearAll = () => {
    setContext("");
    setPrompt("");
    setModelOutput("");
    setActivePresetTitle("Custom Evaluation");
    setMetrics(null);
    setAiEvaluation(null);
    addToast("Cleared all workspace fields.", "info");
  };

  // Seed sample comparison data
  const handleSeedSamples = () => {
    const samples = getInitialLeaderboard();
    setLeaderboard(samples);
    addToast("Loaded sample model comparisons (Claude vs GPT vs 7B)!", "success");
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    setLeaderboard((prev) => prev.filter((item) => item.id !== id));
    addToast("Removed entry from leaderboard.", "info");
  };

  // Clear leaderboard
  const handleClearLeaderboard = () => {
    if (window.confirm("Are you sure you want to clear the entire leaderboard?")) {
      setLeaderboard([]);
      addToast("Leaderboard cleared.", "info");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* App Header with Multi-Page Navigation */}
      <Header
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onResetTest={handleResetTest}
        onCustomBlank={handleStartCustomBlank}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leaderboardCount={leaderboard.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active Context & Spec Status Bar (Visible in workbench tabs) */}
        {activeTab !== "the_benchies" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2.5 flex-wrap gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ACTIVE SPECIFICATION:
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                {activePresetTitle}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  evalMode === "strict_verbatim"
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                {evalMode === "strict_verbatim" ? "Strict Verbatim Fidelity" : "Standard Grounding Audit"}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                id="btn-switch-custom-blank"
                onClick={handleStartCustomBlank}
                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-semibold px-3.5 py-1.5 transition-all shadow-2xs cursor-pointer"
              >
                + Blank Custom Test
              </button>

              <button
                type="button"
                id="btn-switch-presets-bar"
                onClick={() => setIsPresetModalOpen(true)}
                className="rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold px-3.5 py-1.5 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>Browse Presets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 0: The Benchies Marketing Homepage */}
        {activeTab === "the_benchies" && (
          <TheBenchiesLanding
            onNavigateTab={setActiveTab}
            onSelectPresetAndLaunch={(preset) => {
              handleSelectPreset(preset);
              setActiveTab("benchmark_lab");
            }}
            onInspectEntry={(entry) => setInspectingEntry(entry)}
            leaderboardEntries={leaderboard}
          />
        )}

        {/* PAGE 1: Verbatim & Code Diff Inspector */}
        {activeTab === "verbatim_diff" && (
          <VerbatimDiffPage
            context={context}
            setContext={setContext}
            modelOutput={modelOutput}
            setModelOutput={setModelOutput}
            metrics={metrics}
            onRunAudit={handleEvaluate}
            onSaveToLeaderboard={() => handleSaveToLeaderboard("Verbatim Diff Verification")}
            onShowToast={addToast}
          />
        )}

        {/* PAGE 2: Benchmark Lab & LLM Playground */}
        {activeTab === "benchmark_lab" && (
          <div className="space-y-4">
            <BenchmarkInput
              modelName={modelName}
              setModelName={setModelName}
              context={context}
              setContext={(v) => {
                setContext(v);
                if (activePresetTitle !== "Custom Evaluation") setActivePresetTitle("Custom Evaluation");
              }}
              prompt={prompt}
              setPrompt={(v) => {
                setPrompt(v);
                if (activePresetTitle !== "Custom Evaluation") setActivePresetTitle("Custom Evaluation");
              }}
              modelOutput={modelOutput}
              setModelOutput={setModelOutput}
              onEvaluate={handleEvaluate}
              onRunGemini={handleRunGemini}
              isGeminiLoading={isGeminiLoading}
              onShowToast={addToast}
              evalMode={evalMode}
              setEvalMode={setEvalMode}
              onStartCustomBlank={handleStartCustomBlank}
              onLoadCodePreset={handleLoadCodePreset}
              onOpenPresets={() => setIsPresetModalOpen(true)}
              onClearAll={handleClearAll}
              activePresetTitle={activePresetTitle}
            />

            {/* Score Dashboard */}
            <div ref={scoreRef}>
              {metrics ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white border border-[#141414] p-3">
                    <span className="font-mono text-xs font-bold uppercase text-[#141414] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Evaluation Results Computed
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("audit_deepdive")}
                      className="border border-[#141414] bg-[#141414] text-white text-[11px] font-mono font-bold uppercase px-3 py-1 hover:bg-[#141414]/90 flex items-center gap-1.5"
                    >
                      <span>Inspect Claims in Forensic Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ScoreDashboard
                    metrics={metrics}
                    modelName={modelName}
                    context={context}
                    prompt={prompt}
                    modelOutput={modelOutput}
                    onSaveToLeaderboard={handleSaveToLeaderboard}
                    onRunAIEvaluation={handleRunAIEvaluation}
                    aiEvaluation={aiEvaluation}
                    isAIEvaluationLoading={isAIEvalLoading}
                  />
                </div>
              ) : (
                <div className="bg-white border border-[#141414] border-dashed p-8 text-center space-y-2">
                  <div className="w-8 h-8 border border-[#141414] bg-[#E4E3E0] mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#141414]" />
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                    STANDBY: READY TO EVALUATE
                  </h3>
                  <p className="font-serif italic text-xs text-[#141414]/70 max-w-md mx-auto leading-relaxed">
                    Paste the output returned by {modelName || "your AI model"} in Section 04, then execute <strong>"05 RUN AUDIT &amp; CALCULATE SCORE"</strong> or <strong>"AUTO-RUN GEMINI"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 3: Forensic Sentence Audit & AI Judge */}
        {activeTab === "audit_deepdive" && (
          <AuditDeepDivePage
            metrics={metrics}
            context={context}
            prompt={prompt}
            modelOutput={modelOutput}
            isAiEvaluating={isAIEvalLoading}
            onRunAiEvaluation={handleRunAIEvaluation}
            onNavigateToLab={() => setActiveTab("benchmark_lab")}
          />
        )}

        {/* PAGE 4: Model Leaderboard & History */}
        {activeTab === "leaderboard" && (
          <Leaderboard
            entries={leaderboard}
            onInspectEntry={(entry) => setInspectingEntry(entry)}
            onDeleteEntry={handleDeleteEntry}
            onClearAll={handleClearLeaderboard}
            onSeedSamples={handleSeedSamples}
          />
        )}
      </main>

      {/* Preset Selector Modal */}
      <PresetSelectorModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        onCustomBlank={handleStartCustomBlank}
        onCodePreset={handleLoadCodePreset}
      />

      {/* Audit Detail Modal */}
      <AuditModal
        entry={inspectingEntry}
        onClose={() => setInspectingEntry(null)}
      />

      {/* Floating Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold uppercase tracking-wider bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-md">
              THE BENCHIES
            </span>
            <span className="text-slate-600 font-medium">
              Where Claims Meet Evidence • Pass or Fail in Public
            </span>
          </div>
          <div className="flex items-center space-x-4 font-semibold text-slate-600">
            <button type="button" onClick={() => setActiveTab("the_benchies")} className="hover:text-slate-950 transition-colors cursor-pointer">Home</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab("verbatim_diff")} className="hover:text-slate-950 transition-colors cursor-pointer">Diff Inspector</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab("benchmark_lab")} className="hover:text-slate-950 transition-colors cursor-pointer">Benchmark Lab</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab("audit_deepdive")} className="hover:text-slate-950 transition-colors cursor-pointer">Forensic Audit</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab("leaderboard")} className="hover:text-slate-950 transition-colors cursor-pointer">Public Ledger</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
