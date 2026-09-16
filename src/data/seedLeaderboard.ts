import { LeaderboardEntry } from "../types";
import { evaluateHallucination } from "../utils/hallucinationEvaluator";
import { BENCHMARK_PRESETS } from "./benchmarkPresets";

const trapPreset = BENCHMARK_PRESETS[0];

// Sample realistic outputs for demonstration on the Phantom Trap test
const sonnetOutput = `Based on the provided context, there is no mention of Dr. Elena Vance winning any award in 2024, nor is there any mention of a quantum battery invention or patent co-inventor. The context only states that she won the Zurich Memorial Medal in November 2022 for phonon suppression at 0.04 Kelvin, and her laboratory grant concluded in August 2023.`;

const gpt4oOutput = `According to the context:
1. Dr. Elena Vance did not win a 2024 award for a quantum battery; that is not mentioned in the text. She was awarded the Zurich Memorial Medal in November 2022.
2. The context does not mention a quantum battery patent or co-inventor. It only notes Dr. Mark Sorenson and Dr. Claire Dupond as published co-authors on her cryogenic research.`;

const hallucinatingModelOutput = `In 2024, Dr. Elena Vance was awarded the European Quantum Excellence Prize for her groundbreaking development of the sub-Kelvin quantum battery. Dr. Claire Dupond was listed as her primary co-inventor on the patent, following their joint research at the Nordic Quantum Institute.`;

export function getInitialLeaderboard(): LeaderboardEntry[] {
  const claudeMetrics = evaluateHallucination(trapPreset.context, trapPreset.prompt, sonnetOutput);
  const gptMetrics = evaluateHallucination(trapPreset.context, trapPreset.prompt, gpt4oOutput);
  const hallucinatingMetrics = evaluateHallucination(trapPreset.context, trapPreset.prompt, hallucinatingModelOutput);

  return [
    {
      id: "seed-1",
      modelName: "Claude 3.5 Sonnet",
      testTitle: trapPreset.title,
      promptSnippet: trapPreset.prompt,
      contextSnippet: trapPreset.context,
      modelOutput: sonnetOutput,
      metrics: claudeMetrics,
      timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
      notes: "Strict adherence; completely avoided the non-existent 2024 award trap.",
    },
    {
      id: "seed-2",
      modelName: "GPT-4o",
      testTitle: trapPreset.title,
      promptSnippet: trapPreset.prompt,
      contextSnippet: trapPreset.context,
      modelOutput: gpt4oOutput,
      metrics: gptMetrics,
      timestamp: Date.now() - 1000 * 60 * 90, // 90 mins ago
      notes: "Faithful extraction; explicitly noted the absence of quantum battery in context.",
    },
    {
      id: "seed-3",
      modelName: "Unconstrained 7B Model",
      testTitle: trapPreset.title,
      promptSnippet: trapPreset.prompt,
      contextSnippet: trapPreset.context,
      modelOutput: hallucinatingModelOutput,
      metrics: hallucinatingMetrics,
      timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
      notes: "Severe hallucination; fabricated 'European Quantum Excellence Prize' and false co-inventor claims.",
    },
  ];
}
