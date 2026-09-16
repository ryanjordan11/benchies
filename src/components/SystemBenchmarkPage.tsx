import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Download,
  FileJson,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { SYSTEM_BENCHMARK_SUITES } from "../data/systemBenchmarkSuites";
import { SystemBenchmarkRun, SystemCaseResult } from "../types";

const RUNS_KEY = "benchies_system_runs_v1";

type Stage = "select" | "seed" | "new-chat" | "responses" | "results";

interface SystemBenchmarkPageProps {
  initialSuiteId?: string;
  onBackHome: () => void;
}

const stageNumber: Record<Stage, number> = {
  select: 0,
  seed: 1,
  "new-chat": 2,
  responses: 3,
  results: 4,
};

export const SystemBenchmarkPage: React.FC<SystemBenchmarkPageProps> = ({
  initialSuiteId = SYSTEM_BENCHMARK_SUITES[0].id,
  onBackHome,
}) => {
  const [suiteId, setSuiteId] = useState(initialSuiteId);
  const [stage, setStage] = useState<Stage>("select");
  const [systemName, setSystemName] = useState("");
  const [modelName, setModelName] = useState("");
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [newChatConfirmed, setNewChatConfirmed] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState("");
  const [run, setRun] = useState<SystemBenchmarkRun | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  const suite = useMemo(
    () => SYSTEM_BENCHMARK_SUITES.find((item) => item.id === suiteId) ?? SYSTEM_BENCHMARK_SUITES[0],
    [suiteId]
  );

  useEffect(() => {
    setSuiteId(initialSuiteId);
  }, [initialSuiteId]);

  const completedOutputs = suite.cases.filter((item) => outputs[item.id]?.trim()).length;

  const copyText = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const resetRun = () => {
    setStage("select");
    setSeedConfirmed(false);
    setNewChatConfirmed(false);
    setOutputs({});
    setRun(null);
    setError("");
    setStartedAt(new Date().toISOString());
  };

  const selectSuite = (id: string) => {
    setSuiteId(id);
    setOutputs({});
    setRun(null);
    setError("");
  };

  const scoreRun = async () => {
    if (!systemName.trim() || !modelName.trim()) {
      setError("Enter the system and model names before scoring.");
      return;
    }
    if (completedOutputs !== suite.cases.length) {
      setError("Paste the complete raw output for every test before scoring.");
      return;
    }

    setError("");
    setIsScoring(true);
    try {
      const response = await fetch("/api/score-system-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.id,
          outputs: suite.cases.map((item) => ({ caseId: item.id, rawOutput: outputs[item.id] })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The evaluator could not score this run.");

      const results = payload.results as SystemCaseResult[];
      const passed = results.filter((item) => item.passed).length;
      const completedAt = new Date().toISOString();
      const fullRun: SystemBenchmarkRun = {
        runId: `benchies-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        suiteId: suite.id,
        suiteTitle: suite.title,
        suiteVersion: suite.version,
        systemName: systemName.trim(),
        modelName: modelName.trim(),
        startedAt,
        completedAt,
        seedPayload: suite.seedPayload,
        cases: suite.cases.map((item) => ({ ...item, rawOutput: outputs[item.id] })),
        results,
        passed,
        total: results.length,
        passRate: Math.round((passed / results.length) * 100),
        hallucinationRate: Math.round(((results.length - passed) / results.length) * 100),
        protocol: "two-chat-cross-session",
      };

      setRun(fullRun);
      setStage("results");
      try {
        const stored = JSON.parse(localStorage.getItem(RUNS_KEY) || "[]") as SystemBenchmarkRun[];
        localStorage.setItem(RUNS_KEY, JSON.stringify([fullRun, ...stored].slice(0, 50)));
      } catch {
        // The downloadable audit record remains available even when local storage is blocked.
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The evaluator could not score this run.");
    } finally {
      setIsScoring(false);
    }
  };

  const exportRun = () => {
    if (!run) return;
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${run.runId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={onBackHome} className="mb-3 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Benchies
          </button>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-500">Official system benchmark</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">Cross-session adversarial test</h1>
        </div>
        <div className="rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-3 text-right">
          <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Protocol</p>
          <p className="mt-1 text-sm font-bold text-zinc-200">Load → New chat → Attack → Audit</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-4 border border-zinc-800 bg-zinc-950">
        {["Load records", "New chat", "Run attacks", "Audit"].map((label, index) => {
          const active = stageNumber[stage] >= index + 1;
          return (
            <div key={label} className={`border-r border-zinc-800 px-2 py-3 text-center last:border-r-0 ${active ? "bg-red-600 text-white" : "text-zinc-600"}`}>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider sm:text-xs">{index + 1}. {label}</span>
            </div>
          );
        })}
      </div>

      {stage === "select" && (
        <section className="space-y-7">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black text-white">Choose the failure surface.</h2>
            <p className="mt-2 text-base leading-7 text-zinc-400">This tests the complete system across a real session boundary. The evaluator scores only the raw answers pasted after the new chat begins.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {SYSTEM_BENCHMARK_SUITES.map((item) => (
              <button
                key={item.id}
                onClick={() => selectSuite(item.id)}
                className={`min-h-56 border p-6 text-left transition ${suiteId === item.id ? "border-red-500 bg-red-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">{item.domain}</span>
                  <span className="border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase text-zinc-400">{item.difficulty}</span>
                </div>
                <h3 className="mt-6 text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.summary}</p>
                <p className="mt-5 font-mono text-xs text-zinc-500">{item.cases.length} tests · v{item.version}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-4 border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-zinc-300">
              System or company name
              <input value={systemName} onChange={(event) => setSystemName(event.target.value)} placeholder="Example: Acme Agent OS" className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3 text-base text-white outline-none focus:border-red-500" />
            </label>
            <label className="text-sm font-bold text-zinc-300">
              Model used
              <input value={modelName} onChange={(event) => setModelName(event.target.value)} placeholder="Example: Claude Sonnet 4.5" className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3 text-base text-white outline-none focus:border-red-500" />
            </label>
          </div>

          <button onClick={() => { setStartedAt(new Date().toISOString()); setStage("seed"); }} className="inline-flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-4 text-base font-black uppercase tracking-wide text-white hover:bg-red-500 sm:w-auto">
            Start official run <ArrowRight className="h-5 w-5" />
          </button>
        </section>
      )}

      {stage === "seed" && (
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">Step 1 · Chat 1</p>
                <h2 className="mt-1 text-xl font-black text-white">Load the complete record</h2>
              </div>
              <button onClick={() => copyText("seed", suite.seedPayload)} className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-200 hover:border-white">
                {copied === "seed" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied === "seed" ? "Copied" : "Copy all"}
              </button>
            </div>
            <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7 text-zinc-300">{suite.seedPayload}</pre>
          </div>
          <aside className="space-y-4">
            <div className="border border-red-500/40 bg-red-500/10 p-5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="mt-4 font-black text-white">Do not run the attacks yet.</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Paste the record into the system being tested and send it. Do not paste it again after opening the new chat.</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
              <input type="checkbox" checked={seedConfirmed} onChange={(event) => setSeedConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-red-600" />
              I sent the complete record in Chat 1.
            </label>
            <button disabled={!seedConfirmed} onClick={() => setStage("new-chat")} className="inline-flex w-full items-center justify-center gap-2 bg-red-600 px-5 py-4 font-black text-white enabled:hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30">
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </aside>
        </section>
      )}

      {stage === "new-chat" && (
        <section className="mx-auto max-w-3xl border border-zinc-800 bg-zinc-900 p-7 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 text-2xl font-black text-red-500">2</div>
          <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-500">Required session boundary</p>
          <h2 className="mt-3 text-3xl font-black text-white">Open a completely new chat.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-400">Do not continue in the record-loading conversation. Do not paste the patient, matter, or project records again. The system must retrieve the correct state itself.</p>
          <label className="mx-auto mt-8 flex max-w-md cursor-pointer items-center justify-center gap-3 border border-zinc-700 bg-black p-4 text-sm font-bold text-zinc-200">
            <input type="checkbox" checked={newChatConfirmed} onChange={(event) => setNewChatConfirmed(event.target.checked)} className="h-4 w-4 accent-red-600" />
            I opened a new chat with no copied context.
          </label>
          <button disabled={!newChatConfirmed} onClick={() => setStage("responses")} className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-4 font-black text-white enabled:hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto">
            Run adversarial prompts <ArrowRight className="h-5 w-5" />
          </button>
        </section>
      )}

      {stage === "responses" && (
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">Step 3 · Chat 2</p>
              <h2 className="mt-2 text-2xl font-black text-white">Run each prompt exactly as written.</h2>
              <p className="mt-2 text-sm text-zinc-400">Paste the complete, unedited response under its prompt.</p>
            </div>
            <p className="font-mono text-sm font-bold text-zinc-300">{completedOutputs}/{suite.cases.length} outputs captured</p>
          </div>

          <div className="space-y-5">
            {suite.cases.map((item, index) => (
              <article key={item.id} className="border border-zinc-800 bg-zinc-900">
                <div className="grid lg:grid-cols-[1fr_1.1fr]">
                  <div className="border-b border-zinc-800 p-5 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">Test {index + 1}</span>
                      <button onClick={() => copyText(item.id, item.prompt)} className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-white">
                        {copied === item.id ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />} {copied === item.id ? "Copied" : "Copy prompt"}
                      </button>
                    </div>
                    <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">{item.pressureType}</p>
                    <p className="mt-5 border-l-2 border-red-500 pl-4 text-base leading-7 text-zinc-200">“{item.prompt}”</p>
                  </div>
                  <div className="p-5">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500" htmlFor={`output-${item.id}`}>Complete raw output</label>
                    <textarea
                      id={`output-${item.id}`}
                      value={outputs[item.id] || ""}
                      onChange={(event) => setOutputs((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="Paste the complete response here. Do not edit or summarize it."
                      className="mt-3 min-h-52 w-full resize-y border border-zinc-700 bg-black p-4 font-mono text-sm leading-6 text-zinc-200 outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {error && <p role="alert" className="mt-5 border border-red-500 bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => setStage("new-chat")} className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-5 py-3 font-bold text-zinc-300 hover:border-white"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button disabled={isScoring || completedOutputs !== suite.cases.length} onClick={scoreRun} className="inline-flex items-center justify-center gap-2 bg-red-600 px-7 py-4 font-black uppercase tracking-wide text-white enabled:hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30">
              {isScoring ? "Evaluating raw outputs…" : "Lock outputs and score"} <ShieldCheck className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}

      {stage === "results" && run && (
        <section className="space-y-6">
          <div className={`border p-6 sm:p-8 ${run.passed === run.total ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}>
            <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Audited result · {run.runId}</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{run.systemName}</h2>
                <p className="mt-2 text-zinc-300">{run.modelName} · {run.suiteTitle} v{run.suiteVersion}</p>
              </div>
              <div className="border-l border-zinc-700 pl-6">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Pass rate</p>
                <p className="mt-1 text-5xl font-black text-white">{run.passRate}%</p>
                <p className="mt-1 text-sm font-bold text-zinc-300">{run.passed}/{run.total} tests</p>
              </div>
              <div className="border-l border-zinc-700 pl-6">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Hallucination rate</p>
                <p className={`mt-1 text-5xl font-black ${run.hallucinationRate === 0 ? "text-emerald-400" : "text-red-400"}`}>{run.hallucinationRate}%</p>
                <p className="mt-1 text-sm font-bold text-zinc-300">failed cases ÷ total</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {run.results.map((result, index) => (
              <article key={result.caseId} className={`border p-5 ${result.passed ? "border-emerald-500/50 bg-emerald-500/5" : "border-red-500/60 bg-red-500/5"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Test {index + 1}</p>
                    <h3 className="mt-1 text-lg font-black text-white">{result.title}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-black ${result.passed ? "bg-emerald-500 text-black" : "bg-red-600 text-white"}`}>
                    {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{result.verdict}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-300">{result.reason}</p>
                {result.triggeredRules.length > 0 && (
                  <div className="mt-4 border-t border-zinc-800 pt-3">
                    {result.triggeredRules.map((rule) => <p key={rule} className="mt-1 font-mono text-xs text-red-300">• {rule}</p>)}
                  </div>
                )}
                <details className="mt-4 border-t border-zinc-800 pt-3">
                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-zinc-500">Inspect raw output</summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap bg-black p-4 font-mono text-xs leading-6 text-zinc-300">{result.rawOutput}</pre>
                </details>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 border border-zinc-800 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">Complete evidence bundle ready</p>
              <p className="mt-1 text-sm text-zinc-500">Records, prompts, raw outputs, verdicts, reasons, timestamps, and protocol metadata.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => copyText("audit", JSON.stringify(run, null, 2))} className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-200 hover:border-white"><FileJson className="h-4 w-4" />{copied === "audit" ? "Copied" : "Copy audit"}</button>
              <button onClick={exportRun} className="inline-flex items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-black text-black hover:bg-zinc-200"><Download className="h-4 w-4" />Download JSON</button>
              <button onClick={resetRun} className="inline-flex items-center justify-center gap-2 bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500"><RotateCcw className="h-4 w-4" />New run</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
