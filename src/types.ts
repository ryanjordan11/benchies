export interface BenchmarkPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  context: string;
  prompt: string;
  testType: "fact_extraction" | "numerical_precision" | "unmentioned_trap" | "technical_spec";
  expectedBehavior: string;
}

export type SentenceStatus = "grounded" | "partial" | "hallucination";
export type EvaluationMode = "standard" | "strict_verbatim";
export type ActiveTab = "the_benchies" | "system_benchmark" | "verbatim_diff" | "benchmark_lab" | "audit_deepdive" | "leaderboard";

export type SystemBenchmarkDomain = "Healthcare" | "Legal" | "Enterprise";

export interface SystemBenchmarkCase {
  id: string;
  title: string;
  pressureType: string;
  prompt: string;
}

export interface SystemBenchmarkSuite {
  id: string;
  title: string;
  domain: SystemBenchmarkDomain;
  version: string;
  summary: string;
  difficulty: "Hard" | "Severe";
  seedPayload: string;
  cases: SystemBenchmarkCase[];
}

export interface SystemCaseResult {
  caseId: string;
  title: string;
  passed: boolean;
  verdict: "PASS" | "FAIL";
  reason: string;
  triggeredRules: string[];
  rawOutput: string;
}

export interface SystemBenchmarkRun {
  runId: string;
  suiteId: string;
  suiteTitle: string;
  suiteVersion: string;
  systemName: string;
  modelName: string;
  startedAt: string;
  completedAt: string;
  seedPayload: string;
  cases: Array<SystemBenchmarkCase & { rawOutput: string }>;
  results: SystemCaseResult[];
  passed: number;
  total: number;
  passRate: number;
  hallucinationRate: number;
  protocol: "two-chat-cross-session";
}

export interface LineDiffItem {
  lineNumber: number;
  contextLine?: string;
  outputLine?: string;
  status: "match" | "modified" | "novel" | "empty";
  similarity: number; // 0 to 100
}

export interface AnalyzedSentence {
  id: string;
  text: string;
  status: SentenceStatus;
  overlapScore: number;
  verbatimMatches: string[];
  novelEntities: string[];
  matchedContextSnippet?: string;
  explanation: string;
}

export interface ExtractedEntities {
  inContext: string[];
  novelInOutput: string[];
  groundedInOutput: string[];
}

export interface AIEvaluationResult {
  groundednessScore: number;
  hallucinationScore: number;
  verbatimFidelityScore: number;
  verdict: string;
  supportedClaims: string[];
  unsupportedClaims: string[];
  reasoning: string;
}

export interface EvaluationMetrics {
  groundednessScore: number; // 0 - 100
  hallucinationScore: number; // 0 - 100
  verbatimScore: number; // 0 - 100
  verbatimPhraseCount: number;
  totalSentences: number;
  groundedSentencesCount: number;
  partialSentencesCount: number;
  hallucinatedSentencesCount: number;
  entities: ExtractedEntities;
  sentenceBreakdown: AnalyzedSentence[];
  highlightTokens: {
    text: string;
    type: "grounded" | "hallucination" | "neutral" | "verbatim";
  }[];
  lineDiffs?: LineDiffItem[];
  aiAudit?: AIEvaluationResult;
  evalMode?: EvaluationMode;
  verbatimStats?: {
    charAccuracy: number;
    exactMatch: boolean;
    tokenCoverage: number;
    matchingLinesCount: number;
    totalLinesCount: number;
  };
  scoringExplanation?: {
    summary: string;
    exactMatchTriggered: boolean;
    promptReferencedEntities: string[];
    fabricatedEntities: string[];
    statementGroundingRatio: number;
    verbatimFidelityRatio: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  modelName: string;
  testTitle: string;
  promptSnippet: string;
  contextSnippet: string;
  modelOutput: string;
  metrics: EvaluationMetrics;
  timestamp: number;
  notes?: string;
}
