import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  Scale,
  ArrowRight,
  Code2,
  FileCheck2,
  Trophy,
  Layers,
  Sparkles,
  GitCompare,
  AlertTriangle,
  Play,
  Cpu,
  RefreshCw,
  Compass,
  FileText,
} from "lucide-react";
import { BenchmarkPreset, LeaderboardEntry, ActiveTab } from "../types";
import { BENCHMARK_PRESETS } from "../data/benchmarkPresets";

interface TheBenchiesLandingProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectPresetAndLaunch: (preset: BenchmarkPreset) => void;
  onInspectEntry: (entry: LeaderboardEntry) => void;
  leaderboardEntries: LeaderboardEntry[];
}

export const TheBenchiesLanding: React.FC<TheBenchiesLandingProps> = ({
  onNavigateTab,
  onSelectPresetAndLaunch,
  onInspectEntry,
  leaderboardEntries,
}) => {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const activePreset = BENCHMARK_PRESETS[selectedDemoIndex] || BENCHMARK_PRESETS[0];

  const categories = [
    {
      id: "hallucinations",
      title: "Hallucinations Verification",
      shortLabel: "Grounding & Attribution",
      icon: ShieldAlert,
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description:
        "Auditing adherence to ground-truth context with zero tolerance for fabricated entities, phantom citations, or answering questions based on false premises.",
      metricName: "Groundedness Score",
      metricTarget: "100% Verified Claims",
      presetIndex: 0,
      failureExample:
        'When asked if Dr. Elena Vance won a 2024 prize, typical models hallucinate a "Global Quantum Innovation Award" and invent a co-inventor "Dr. Alexander Sterling" instead of checking the text.',
      passExample:
        "The model explicitly catches the trap: verifies no 2024 award exists in context, references the real 2022 Zurich Medal, and identifies the genuine co-authors.",
    },
    {
      id: "determinism",
      title: "Determinism",
      shortLabel: "Seed Stability & Number Jitter",
      icon: Scale,
      color: "blue",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Measuring variance across identical prompts, temperature floors, and structured schemas. If an agent answers differently each time, it cannot be trusted in production.",
      metricName: "Variance & Margin Accuracy",
      metricTarget: "0% Schema / Number Jitter",
      presetIndex: 1,
      failureExample:
        "Model rounds $48.2M GAAP revenue to 'approx $50M', alters operating margins from 18.4% to 19%, or scrambles JSON structures on subsequent calls.",
      passExample:
        "Model outputs exact GAAP figures, preserves full-year guidance range ($192.0M–$195.5M), and captures exact net customer additions without token drift.",
    },
    {
      id: "context-drift",
      title: "Context Drift",
      shortLabel: "Needle Retrieval & Distraction",
      icon: Compass,
      color: "indigo",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description:
        "Testing whether models remember early constraints, ignore distractor logs, and preserve timeline integrity across multi-page dense documentation.",
      metricName: "Timeline & Needle Retention",
      metricTarget: "Zero Mid-Context Erasure",
      presetIndex: 3,
      failureExample:
        "Model confuses Station Alpha (Tromsø) with Station Beta (Kiruna), loses the 1981 ozone anomaly, or attributes Bergen archives to Oslo under dense token loads.",
      passExample:
        "Precise chronological sequencing across all 3 Scandinavian observation stations and exact preservation of the 142 balloon deployments.",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      shortLabel: "Verbatim Diffing & Public Audit",
      icon: FileCheck2,
      color: "purple",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      description:
        "Every benchmark test produces an immutable, line-by-line diff and cryptographic trace. No private eval scores, no self-reported marketing benchmarks.",
      metricName: "Verbatim Token Fidelity",
      metricTarget: "Character-for-Character Verification",
      presetIndex: 2,
      failureExample:
        "Vendor publishes high benchmark percentages on private closed-source sets, but produces untraceable hallucinations when tested on public clinical protocols.",
      passExample:
        "Public scorecard with exact character-level diff, sentence attribution, and open inspection available to any engineer in the world.",
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 lg:p-16 shadow-xs overflow-hidden">
        {/* Subtle decorative background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60"></div>
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <span>The Benchies • Open AI Evaluation Arena</span>
            <span className="w-1 h-1 rounded-full bg-amber-400"></span>
            <span className="text-amber-700 font-medium">Zero Private Evals</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.06]">
              Bring your AI.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-slate-500">
                Prove it works.
              </span>
            </h1>

            {/* Core user statement quote */}
            <div className="max-w-2xl mx-auto pt-2 pb-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-700 italic tracking-tight">
                &ldquo;Don&rsquo;t tell us your AI is reliable. Show us.&rdquo;
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              This is not about promises, marketing claims, or cherry-picked demos.{" "}
              <strong className="text-slate-900 font-semibold">The Benchies is an open challenge</strong>:
              any model, any agent architecture, the exact same tests, and public results.
            </p>

            <div className="inline-block rounded-lg bg-slate-100 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 tracking-wide uppercase">
              The place where claims meet evidence. Pass or fail in public.
            </div>
          </div>

          {/* 4 Pillars Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Model Scope</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Any Model</div>
              <div className="text-xs text-slate-500 mt-1">Proprietary or Open</div>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Architecture</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Any Agent Stack</div>
              <div className="text-xs text-slate-500 mt-1">RAG, Workflows, Single LLMs</div>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Benchmark Test</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Same Trap Tests</div>
              <div className="text-xs text-slate-500 mt-1">Identical Adversarial Inputs</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">Audit Outcome</div>
              <div className="text-sm font-bold text-emerald-950 mt-0.5">Public Results</div>
              <div className="text-xs text-emerald-700 mt-1">Full Verbatim Scorecards</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              id="hero-cta-enter-lab"
              onClick={() => onNavigateTab("benchmark_lab")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Enter the Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              id="hero-cta-diff-inspector"
              onClick={() => onNavigateTab("verbatim_diff")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Code2 className="w-4 h-4 text-slate-500" />
              <span>Verbatim Diff Inspector</span>
            </button>

            <button
              type="button"
              id="hero-cta-leaderboard"
              onClick={() => onNavigateTab("leaderboard")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Public Ledger</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. The 4 Categories Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <span>The Diagnostic Vectors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 tracking-tight">
              The 4 Challenge Categories
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Every model or agent system entering The Benchies is subjected to the same 4 diagnostic tests. No exceptions, no private exemptions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                          <h3 className="text-lg font-bold text-slate-950 tracking-tight">
                            {cat.title}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500">{cat.shortLabel}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cat.badgeClass}`}>
                      {cat.metricName}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Concrete Pass vs Fail Comparison */}
                  <div className="space-y-2.5 pt-1">
                    <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-3.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-800 uppercase tracking-wider text-[10px] mb-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Common AI Failure Mode:</span>
                      </div>
                      <p className="text-rose-950 leading-relaxed font-normal">{cat.failureExample}</p>
                    </div>

                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 uppercase tracking-wider text-[10px] mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>The Benchies Pass Standard:</span>
                      </div>
                      <p className="text-emerald-950 leading-relaxed font-normal">{cat.passExample}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Pass Target: <strong className="text-slate-800 font-semibold">{cat.metricTarget}</strong>
                  </div>
                  <button
                    type="button"
                    id={`btn-challenge-${cat.id}`}
                    onClick={() => {
                      const preset = BENCHMARK_PRESETS[cat.presetIndex] || BENCHMARK_PRESETS[0];
                      onSelectPresetAndLaunch(preset);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-900 hover:text-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <span>Test in Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Manifesto Comparison: Where Claims Meet Evidence */}
      <section className="rounded-3xl border border-slate-800 bg-slate-950 text-white p-8 sm:p-12 lg:p-14 shadow-md">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              The Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Where Claims Meet Evidence
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Every vendor claims enterprise reliability and 99% accuracy. Here is how The Benchies separates verifiable truth from marketing fiction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* The Marketing Status Quo */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 pb-2 border-b border-rose-500/20 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>The AI Marketing Status Quo</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">&times;</span>
                  <span><strong>Private evaluations:</strong> Benchmarks run behind closed doors with undisclosed system prompts and secret test sets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">&times;</span>
                  <span><strong>Cherry-picked demos:</strong> Presenting the single perfect completion out of twenty unprompted failures.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">&times;</span>
                  <span><strong>Concealed hallucinations:</strong> Subtle math errors, phantom patents, and fabricated citations swept under the rug.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">&times;</span>
                  <span><strong>Vibe-based scores:</strong> Vague &ldquo;state-of-the-art&rdquo; badges without verifiable token-level diffs.</span>
                </li>
              </ul>
            </div>

            {/* The Benchies Standard */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-emerald-500/20 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>The Benchies Open Standard</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">&check;</span>
                  <span><strong>Open challenge suite:</strong> Every model, pipeline, and agent architecture receives the exact same context and trap.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">&check;</span>
                  <span><strong>Automated verbatim diffs:</strong> Sentence-by-sentence attribution and token matching directly against ground truth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">&check;</span>
                  <span><strong>Adversarial trap detection:</strong> Active penalties for fabricating unmentioned metrics, dates, or co-authors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">&check;</span>
                  <span><strong>Public ledger:</strong> Pass or fail in public. Every result is inspectable by any developer in the world.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Scenario Sampler */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Challenge Presets</div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5 tracking-tight">
              Test Scenario Sampler
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {BENCHMARK_PRESETS.length} Official Presets Available
          </span>
        </div>

        {/* Preset Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BENCHMARK_PRESETS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              id={`tab-preset-sampler-${idx}`}
              onClick={() => setSelectedDemoIndex(idx)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                selectedDemoIndex === idx
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-semibold mb-1 opacity-75">
                <span>0{idx + 1}</span>
                <span className="font-mono">{p.testType.replace("_", " ")}</span>
              </div>
              <div className="text-xs font-bold truncate">{p.title}</div>
            </button>
          ))}
        </div>

        {/* Active Scenario Details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full">
                {activePreset.category}
              </span>
              <h3 className="text-base font-bold text-slate-950 mt-1">
                {activePreset.title}
              </h3>
            </div>

            <button
              type="button"
              id="btn-launch-active-preset"
              onClick={() => onSelectPresetAndLaunch(activePreset)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <span>Launch in Benchmark Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            {/* Context Box */}
            <div className="space-y-1.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Ground-Truth Source Context</span>
              </span>
              <div className="rounded-lg bg-white border border-slate-200 p-3.5 h-44 overflow-y-auto font-mono text-[11px] text-slate-800 leading-relaxed shadow-2xs">
                {activePreset.context}
              </div>
            </div>

            {/* Prompt & Expected */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>The Adversarial Challenge Prompt</span>
                </span>
                <div className="rounded-lg bg-amber-50/90 border border-amber-200 p-3.5 text-xs text-amber-950 font-medium leading-relaxed">
                  {activePreset.prompt}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
                  Expected Behavior / Pass Standard:
                </span>
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-700 leading-relaxed">
                  {activePreset.expectedBehavior}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Public Ledger Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Public Verification Ledger</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950 mt-0.5 tracking-tight">
              Recent Model Evaluations
            </h2>
          </div>
          <button
            type="button"
            id="btn-view-all-leaderboard"
            onClick={() => onNavigateTab("leaderboard")}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Full Leaderboard ({leaderboardEntries.length} runs)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Model / Architecture</th>
                  <th className="py-3 px-4">Challenge Test</th>
                  <th className="py-3 px-4 text-center">Groundedness</th>
                  <th className="py-3 px-4 text-center">Hallucination Risk</th>
                  <th className="py-3 px-4 text-center">Verbatim Match</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardEntries.slice(0, 5).map((entry, idx) => {
                  const isTop = idx === 0;
                  const groundedScore = entry.metrics?.groundednessScore ?? 0;
                  const hallucinationScore = entry.metrics?.hallucinationScore ?? 0;
                  const verbatimScore = entry.metrics?.verbatimScore ?? 0;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400 w-12">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{entry.modelName}</span>
                          {isTop && (
                            <span className="text-[10px] bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-bold text-amber-900">
                              TOP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {entry.testTitle}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                            groundedScore >= 90
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : groundedScore >= 70
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {groundedScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                            hallucinationScore === 0
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : hallucinationScore <= 15
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {hallucinationScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                        {verbatimScore}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          id={`btn-audit-entry-${entry.id}`}
                          onClick={() => onInspectEntry(entry)}
                          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 px-3 py-1 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Bottom Call to Action Banner */}
      <section className="rounded-3xl border border-slate-900 bg-slate-900 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/80 via-slate-900 to-slate-950 pointer-events-none"></div>

        <div className="relative max-w-2xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Open Public Evaluation
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Bring your system.
            <br />
            Pass or fail in public.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            Got an LLM, RAG pipeline, fine-tune, or compound agent? Test it against the four vectors today. No signups, no sales pitch.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            id="btn-footer-launch-lab"
            onClick={() => onNavigateTab("benchmark_lab")}
            className="px-7 py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Open Benchmark Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-footer-launch-diff"
            onClick={() => onNavigateTab("verbatim_diff")}
            className="px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-slate-300" />
            <span>Verbatim Diff Inspector</span>
          </button>
        </div>
      </section>
    </div>
  );
};
