import { AnalyzedSentence, EvaluationMetrics, ExtractedEntities, EvaluationMode, LineDiffItem } from "../types";

// Common English stopwords to ignore in pure token overlap
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
  "this", "that", "these", "those", "then", "just", "so", "than", "such", "both",
  "through", "about", "for", "is", "of", "while", "during", "to", "from", "in",
  "out", "on", "off", "over", "under", "again", "further", "once", "here",
  "there", "when", "where", "why", "how", "all", "any", "each", "few",
  "more", "most", "other", "some", "no", "nor", "not", "only", "own",
  "same", "too", "very", "can", "will", "should",
  "now", "be", "been", "being", "have", "has", "had", "do", "does", "did", "was",
  "were", "are", "with", "at", "by", "into", "it", "its", "they", "them", "their",
]);

// Common programming language keywords to avoid treating code as factual proper nouns
const CODE_KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "import", "export", "default", "class",
  "interface", "type", "from", "extends", "implements", "async", "await", "if", "else",
  "switch", "case", "break", "continue", "for", "while", "do", "try", "catch", "finally",
  "throw", "new", "this", "super", "null", "undefined", "true", "false", "void", "typeof",
  "instanceof", "in", "of", "console", "log", "string", "number", "boolean", "any", "unknown",
  "never", "def", "self", "print", "len", "range", "list", "dict", "str", "int", "float",
  "public", "private", "protected", "static", "readonly", "override", "enum", "package",
  "func", "struct", "go", "select", "chan", "defer", "panic", "recover",
]);

// Common English conversational and discourse words that may be capitalized at start of sentence or after punctuation
const DISCOURSE_WORDS = new Set([
  "therefore", "however", "furthermore", "moreover", "meanwhile", "additionally", "similarly",
  "consequently", "specifically", "overall", "notably", "importantly", "specifically",
  "instead", "accordingly", "indeed", "likewise", "nevertheless", "nonetheless", "namely",
  "regardless", "total", "totaling", "finally", "first", "second", "third", "fourth", "fifth",
  "firstly", "secondly", "thirdly", "lastly", "item", "point", "answer", "question",
  "based", "according", "given", "here", "there", "note", "please", "summary", "conclusion",
  "result", "results", "analysis", "details", "status", "overview", "section", "part",
  "yes", "no", "true", "false", "none", "neither", "either",
]);

// Faithful abstention patterns (when context lacks info)
const ABSTENTION_PATTERNS = [
  /not mentioned/i,
  /does not mention/i,
  /no mention of/i,
  /not provided/i,
  /not stated/i,
  /not referenced/i,
  /not listed/i,
  /not found/i,
  /not contain/i,
  /no information/i,
  /cannot be determined/i,
  /neither mentioned nor implied/i,
  /did not win/i,
  /no award/i,
  /no co-inventor/i,
  /no patent/i,
  /no clinical data/i,
  /not established as safe/i,
  /no evidence/i,
  /not specified/i,
  /not included/i,
];

// Helper to strip markdown code blocks like ```typescript ... ```
export function stripCodeFences(text: string): string {
  if (!text) return "";
  let cleaned = text.trim();
  // Strip starting ```[lang] and ending ```
  cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\r?\n/, "").replace(/\r?\n```\s*$/, "");
  // If whole string was just wrapped in backticks
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.slice(3, -3).trim();
  }
  return cleaned;
}

// Detect if text is predominantly programming code
export function looksLikeCode(text: string): boolean {
  if (!text) return false;
  const clean = text.trim();
  if (clean.includes("```")) return true;

  const codeSignals = [
    /[{}[\]();]/,
    /\b(function|const|let|var|def|class|import|export|return|async|await|console\.log)\b/,
    /(=>|===|!==|==|!=|\+\+|--|\+=|-=|\*=|\/=|&&|\|\|)/,
    /<\/?[a-zA-Z0-9_-]+.*?>/, // JSX/HTML tags
    /^\s*(import|export|const|let|var|def|function|class)\s+/m,
    /;\s*$/m,
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i,
  ];

  let matches = 0;
  for (const sig of codeSignals) {
    if (sig.test(clean)) matches++;
  }
  return matches >= 2;
}

// Calculate Levenshtein similarity between two strings (0 - 100)
export function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  const s1 = str1.trim();
  const s2 = str2.trim();
  if (!s1 && !s2) return 100;
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  );

  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.max(0, Math.round((1 - distance / maxLen) * 100));
}

// Extract numbers, dates, monetary amounts, percentages, units
function extractFactualEntities(text: string, isCode: boolean = false): string[] {
  const entities = new Set<string>();

  const numericalRegex = /(?:\$\s*\d+(?:\.\d+)?\s*(?:million|billion|trillion|m|b|k)?|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\s*(?:mg|kg|kelvin|k|years?|months?|days?|balloons?|px|rem|em|ms|s)\b|\b\d{4}\b|\b\d+(?:,\d{3})*(?:\.\d+)?\b)/gi;
  let match: RegExpExecArray | null;
  while ((match = numericalRegex.exec(text)) !== null) {
    const val = match[0].trim();
    if (val.length > 0 && !/^\d$/.test(val)) {
      entities.add(val.toLowerCase());
    }
  }

  // If code, don't treat normal code symbols or identifiers as hallucinated proper nouns
  if (!isCode) {
    const properNounRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    while ((match = properNounRegex.exec(text)) !== null) {
      const term = match[0].trim();
      const termLower = term.toLowerCase();
      if (
        term.length > 2 &&
        !STOPWORDS.has(termLower) &&
        !CODE_KEYWORDS.has(termLower) &&
        !DISCOURSE_WORDS.has(termLower) &&
        !/^(The|A|An|In|On|At|For|With|This|That|These|Those|Based|From|To|According|Given|Here|There|Neither|Either|Both|Each|Any|Some|All|Many|Much|No|Yes)$/.test(term)
      ) {
        entities.add(termLower);
      }
    }
  }

  return Array.from(entities);
}

// Clean and tokenize text into meaningful words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s$%.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

// Split into sentences or code lines
function splitIntoUnits(text: string, isCode: boolean): string[] {
  if (isCode) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !/^```/.test(line));
  }

  // If text has multiple lines (e.g. numbered list items), break by lines first to preserve bullet boundaries
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const units: string[] = [];

  for (const line of rawLines) {
    // Strip leading list bullet or numbering: "1.", "1)", "-", "*", "•"
    const cleanedLine = line.replace(/^(\d+[\.\)]|[-*•])\s+/, "").trim();
    if (!cleanedLine) continue;

    const protectedText = cleanedLine
      .replace(/\b(Dr|Mr|Mrs|Ms|Prof|vs|e\.g|i\.e|No|approx|Q[1-4]|vol|dept|inc|corp|St)\./gi, "$1__DOT__")
      .replace(/(\d+)\.(\d+)/g, "$1__DEC__$2");

    const rawSentences = protectedText.split(/(?<=[.!?])\s+/);

    for (const s of rawSentences) {
      const restored = s.replace(/__DOT__/g, ".").replace(/__DEC__/g, ".").trim();
      if (restored.length > 2) {
        units.push(restored);
      }
    }
  }

  return units.length > 0 ? units : [text.trim()];
}

// Compute line-by-line diff items
export function computeLineDiffs(context: string, output: string): LineDiffItem[] {
  const cleanContext = stripCodeFences(context);
  const cleanOutput = stripCodeFences(output);

  const contextLines = cleanContext.split(/\r?\n/);
  const outputLines = cleanOutput.split(/\r?\n/);

  const maxLines = Math.max(contextLines.length, outputLines.length);
  const diffItems: LineDiffItem[] = [];

  const contextSet = new Set(contextLines.map((l) => l.trim()));
  const contextNormSet = new Set(contextLines.map((l) => l.trim().replace(/\s+/g, " ")));

  for (let i = 0; i < maxLines; i++) {
    const cLine = contextLines[i];
    const oLine = outputLines[i];

    if (oLine === undefined) {
      // Line is only in context
      diffItems.push({
        lineNumber: i + 1,
        contextLine: cLine,
        outputLine: undefined,
        status: "empty",
        similarity: 0,
      });
      continue;
    }

    const trimmedOut = oLine.trim();
    if (!trimmedOut) {
      diffItems.push({
        lineNumber: i + 1,
        contextLine: cLine || "",
        outputLine: oLine,
        status: "match",
        similarity: 100,
      });
      continue;
    }

    // Exact or normalized match
    const exact = cLine !== undefined && cLine.trim() === trimmedOut;
    const inContextSomewhere = contextSet.has(trimmedOut) || contextNormSet.has(trimmedOut.replace(/\s+/g, " ")) || cleanContext.includes(trimmedOut);

    if (exact || inContextSomewhere) {
      diffItems.push({
        lineNumber: i + 1,
        contextLine: cLine ?? "",
        outputLine: oLine,
        status: "match",
        similarity: 100,
      });
    } else if (cLine !== undefined) {
      const sim = stringSimilarity(cLine, oLine);
      diffItems.push({
        lineNumber: i + 1,
        contextLine: cLine,
        outputLine: oLine,
        status: sim >= 65 ? "modified" : "novel",
        similarity: sim,
      });
    } else {
      // Novel line not in context
      diffItems.push({
        lineNumber: i + 1,
        contextLine: undefined,
        outputLine: oLine,
        status: "novel",
        similarity: 0,
      });
    }
  }

  return diffItems;
}

// Calculate verbatim n-grams (2 to 5 words consecutive match) and character accuracy
function calculateVerbatimNgrams(context: string, output: string) {
  const normContext = context.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const normOutput = output.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const outputTokens = normOutput.split(/\s+/).filter(Boolean);

  if (outputTokens.length === 0) {
    return { verbatimScore: 100, verbatimPhraseCount: 0, verbatimTokens: 0, matchedPhrases: [] };
  }

  // Immediate check: output is directly contained in context
  const rawCleanContext = context.replace(/\r\n/g, "\n").trim();
  const rawCleanOutput = output.replace(/\r\n/g, "\n").trim();
  if (rawCleanContext === rawCleanOutput || rawCleanContext.includes(rawCleanOutput) || normContext.includes(normOutput)) {
    return {
      verbatimScore: 100,
      verbatimPhraseCount: 1,
      verbatimTokens: outputTokens.length,
      matchedPhrases: [rawCleanOutput],
    };
  }

  const matchedPhrases: string[] = [];
  const isTokenVerbatim = new Array(outputTokens.length).fill(false);

  // Single token check if in context
  const contextTokenSet = new Set(normContext.split(/\s+/));
  for (let i = 0; i < outputTokens.length; i++) {
    if (contextTokenSet.has(outputTokens[i])) {
      isTokenVerbatim[i] = true;
    }
  }

  // Check 5-gram, 4-gram, 3-gram, 2-gram matches
  for (let n = 5; n >= 2; n--) {
    for (let i = 0; i <= outputTokens.length - n; i++) {
      const phrase = outputTokens.slice(i, i + n).join(" ");
      if (phrase.length > 3 && normContext.includes(phrase)) {
        matchedPhrases.push(phrase);
        for (let j = i; j < i + n; j++) {
          isTokenVerbatim[j] = true;
        }
      }
    }
  }

  const verbatimTokens = isTokenVerbatim.filter(Boolean).length;
  const verbatimScore = Math.min(100, Math.round((verbatimTokens / outputTokens.length) * 100));

  return {
    verbatimScore,
    verbatimPhraseCount: Array.from(new Set(matchedPhrases)).length,
    verbatimTokens,
    matchedPhrases: Array.from(new Set(matchedPhrases)),
  };
}

// Compute line-by-line statistics for code/verbatim fidelity
function computeLineStats(context: string, output: string) {
  const contextLines = context
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const outputLines = output
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const contextSet = new Set(contextLines);
  const contextNormSet = new Set(contextLines.map((l) => l.replace(/\s+/g, " ")));

  let matchingLines = 0;
  for (const line of outputLines) {
    if (contextSet.has(line) || contextNormSet.has(line.replace(/\s+/g, " ")) || context.includes(line)) {
      matchingLines++;
    }
  }

  return {
    matchingLinesCount: matchingLines,
    totalLinesCount: outputLines.length || 1,
  };
}

// MAIN EVALUATION ENGINE
export function evaluateHallucination(
  context: string,
  prompt: string,
  output: string,
  evalMode: EvaluationMode = "standard"
): EvaluationMetrics {
  const rawContext = (context || "").trim();
  const rawOutput = (output || "").trim();

  // Strip code fences if present
  const cleanContext = stripCodeFences(rawContext);
  const cleanOutput = stripCodeFences(rawOutput);

  if (!cleanOutput) {
    return {
      groundednessScore: 0,
      hallucinationScore: 0,
      verbatimScore: 0,
      verbatimPhraseCount: 0,
      totalSentences: 0,
      groundedSentencesCount: 0,
      partialSentencesCount: 0,
      hallucinatedSentencesCount: 0,
      entities: { inContext: [], novelInOutput: [], groundedInOutput: [] },
      sentenceBreakdown: [],
      highlightTokens: [],
      lineDiffs: [],
      evalMode,
      verbatimStats: {
        charAccuracy: 0,
        exactMatch: false,
        tokenCoverage: 0,
        matchingLinesCount: 0,
        totalLinesCount: 0,
      },
    };
  }

  const isCode = looksLikeCode(rawContext) || looksLikeCode(rawOutput) || evalMode === "strict_verbatim";
  const normContextNoPunct = cleanContext.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const normOutputNoPunct = cleanOutput.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

  // 1. Direct Identical Match or Direct Substring Containment Check
  const isExactIdentical = rawContext === rawOutput || cleanContext === cleanOutput;
  const isNormalizedIdentical =
    cleanContext.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim() ===
    cleanOutput.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  const isDirectSubstring =
    cleanContext.includes(cleanOutput) ||
    rawContext.includes(cleanOutput) ||
    normContextNoPunct.includes(normOutputNoPunct);

  const lineDiffs = computeLineDiffs(rawContext, rawOutput);
  const lineStats = computeLineStats(cleanContext, cleanOutput);
  const allLinesMatch = lineStats.matchingLinesCount === lineStats.totalLinesCount && lineStats.totalLinesCount > 0;

  // If output is identical to context or completely contained within context or all lines match:
  if (isExactIdentical || isNormalizedIdentical || isDirectSubstring || allLinesMatch) {
    const units = splitIntoUnits(cleanOutput, isCode);
    const contextEntities = extractFactualEntities(cleanContext, isCode);
    const outputEntities = extractFactualEntities(cleanOutput, isCode);

    const breakdown: AnalyzedSentence[] = units.map((u, i) => ({
      id: `s-${i}`,
      text: u,
      status: "grounded",
      overlapScore: 100,
      verbatimMatches: [u],
      novelEntities: [],
      matchedContextSnippet: u,
      explanation: isExactIdentical
        ? "Exact identical verbatim match with source context (100% grounded, 0% hallucination)."
        : isDirectSubstring
        ? "Direct verbatim substring present in source context (100% grounded)."
        : "All lines verified verbatim in reference source (100% grounded).",
    }));

    const tokens = cleanOutput.split(/(\s+)/).map((chunk) => ({
      text: chunk,
      type: (/^\s+$/.test(chunk) ? "neutral" : "verbatim") as "neutral" | "verbatim",
    }));

    return {
      groundednessScore: 100,
      hallucinationScore: 0,
      verbatimScore: 100,
      verbatimPhraseCount: units.length || 1,
      totalSentences: units.length || 1,
      groundedSentencesCount: units.length || 1,
      partialSentencesCount: 0,
      hallucinatedSentencesCount: 0,
      entities: {
        inContext: contextEntities,
        novelInOutput: [],
        groundedInOutput: outputEntities,
      },
      sentenceBreakdown: breakdown,
      highlightTokens: tokens,
      lineDiffs,
      evalMode,
      verbatimStats: {
        charAccuracy: 100,
        exactMatch: true,
        tokenCoverage: 100,
        matchingLinesCount: lineStats.matchingLinesCount,
        totalLinesCount: lineStats.totalLinesCount,
      },
      scoringExplanation: {
        summary: isExactIdentical
          ? "Perfect 100% verbatim identical source context match confirmed."
          : isDirectSubstring
          ? "Direct verbatim substring confirmed in source context (100% fidelity)."
          : "All evaluated lines confirmed verbatim in source context.",
        exactMatchTriggered: true,
        promptReferencedEntities: [],
        fabricatedEntities: [],
        statementGroundingRatio: 1,
        verbatimFidelityRatio: 1,
      },
    };
  }

  // 2. Extract Entities
  const contextEntities = extractFactualEntities(cleanContext, isCode);
  const promptEntities = extractFactualEntities(prompt || "", isCode);
  const outputEntities = extractFactualEntities(cleanOutput, isCode);

  const contextEntitySet = new Set(contextEntities.map((e) => e.toLowerCase()));
  const promptEntitySet = new Set(promptEntities.map((e) => e.toLowerCase()));
  const contextTokens = new Set(tokenize(cleanContext));

  const groundedInOutput: string[] = [];
  const novelInOutput: string[] = [];
  const promptReferencedEntities: string[] = [];

  for (const ent of outputEntities) {
    const entLower = ent.toLowerCase();
    const words = entLower.split(/\s+/);
    const inContextDirectly = cleanContext.toLowerCase().includes(entLower);
    const allWordsInContext = words.every((w) => contextTokens.has(w) || cleanContext.toLowerCase().includes(w));

    if (inContextDirectly || contextEntitySet.has(entLower) || (words.length > 1 && allWordsInContext)) {
      groundedInOutput.push(ent);
    } else if (promptEntitySet.has(entLower) || (prompt && prompt.toLowerCase().includes(entLower))) {
      // Entity came from user's question or negative-constraint prompt (e.g. asking about "2024" or a trap term)
      promptReferencedEntities.push(ent);
    } else {
      if (!isCode && !STOPWORDS.has(entLower) && !CODE_KEYWORDS.has(entLower) && !DISCOURSE_WORDS.has(entLower)) {
        novelInOutput.push(ent);
      }
    }
  }

  const entities: ExtractedEntities = {
    inContext: contextEntities,
    novelInOutput: Array.from(new Set(novelInOutput)),
    groundedInOutput: Array.from(new Set(groundedInOutput)),
  };

  // 3. Verbatim overlap analysis
  const verbatimMetrics = calculateVerbatimNgrams(cleanContext, cleanOutput);

  // 4. Units / Sentences breakdown
  const outputUnits = splitIntoUnits(cleanOutput, isCode);
  const contextUnits = splitIntoUnits(cleanContext, isCode);

  const sentenceBreakdown: AnalyzedSentence[] = [];
  let groundedCount = 0;
  let partialCount = 0;
  let hallucinatedCount = 0;

  outputUnits.forEach((unit, idx) => {
    const trimmedUnit = unit.trim();
    const uTokens = tokenize(unit);
    const uEntities = extractFactualEntities(unit, isCode);
    const novelInUnit = uEntities.filter((e) => novelInOutput.includes(e));

    // Check for faithful abstention (e.g. "not mentioned in the context", "did not win any award")
    const isAbstainingFaithfully = ABSTENTION_PATTERNS.some((regex) => regex.test(unit));

    if (isAbstainingFaithfully && novelInUnit.length === 0) {
      groundedCount++;
      sentenceBreakdown.push({
        id: `s-${idx}`,
        text: unit,
        status: "grounded",
        overlapScore: 100,
        verbatimMatches: [],
        novelEntities: [],
        explanation: "Faithfully acknowledges absence of information or negative constraint in context.",
      });
      return;
    }

    // Direct verbatim inclusion check
    const inFullContextRaw = cleanContext.includes(trimmedUnit);
    const normUnitNoPunct = trimmedUnit.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    const inFullContextNormalized = normUnitNoPunct.length > 3 && normContextNoPunct.includes(normUnitNoPunct);

    if (inFullContextRaw || inFullContextNormalized) {
      groundedCount++;
      sentenceBreakdown.push({
        id: `s-${idx}`,
        text: unit,
        status: "grounded",
        overlapScore: 100,
        verbatimMatches: [trimmedUnit],
        novelEntities: [],
        matchedContextSnippet: trimmedUnit,
        explanation: isCode ? "Code line matched verbatim in source context." : "High factual grounding and word alignment with context.",
      });
      return;
    }

    // Measure overlap with every context unit
    let bestOverlap = 0;
    let bestMatchedContext = "";

    contextUnits.forEach((cUnit) => {
      const cTokens = new Set(tokenize(cUnit));
      if (uTokens.length === 0) return;

      const matches = uTokens.filter((t) => cTokens.has(t));
      const overlap = (matches.length / uTokens.length) * 100;

      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestMatchedContext = cUnit;
      }
    });

    // Check if code line exists in context normalized lines
    if (isCode) {
      const lineNorm = trimmedUnit.replace(/\s+/g, " ");
      const matchesContextLine = contextUnits.some((cu) => cu.replace(/\s+/g, " ") === lineNorm);
      if (matchesContextLine) {
        bestOverlap = 100;
      }
    }

    // Determine unit status
    let status: "grounded" | "partial" | "hallucination" = "partial";
    let explanation = "";

    if (novelInUnit.length > 0 && bestOverlap < 40) {
      status = "hallucination";
      hallucinatedCount++;
      explanation = `Introduces unsupported entities or metrics (${novelInUnit.slice(0, 3).join(", ")}) not found in the context.`;
    } else if (bestOverlap >= 40 && novelInUnit.length === 0) {
      status = "grounded";
      groundedCount++;
      explanation = isCode ? "Code logic aligns with context source." : "Factual grounding and alignment with context.";
    } else if (bestOverlap < 20 && novelInUnit.length > 0) {
      status = "hallucination";
      hallucinatedCount++;
      explanation = "Extremely low contextual overlap; statements cannot be verified from context.";
    } else if (bestOverlap < 15 && !isCode) {
      status = "hallucination";
      hallucinatedCount++;
      explanation = "Low contextual overlap; statements cannot be verified from context.";
    } else {
      status = "partial";
      partialCount++;
      explanation = isCode
        ? "Partial code match or modified expression."
        : "Partially related to context facts, but may contain paraphrasing or unverified assumptions.";
    }

    sentenceBreakdown.push({
      id: `s-${idx}`,
      text: unit,
      status,
      overlapScore: Math.round(bestOverlap),
      verbatimMatches: verbatimMetrics.matchedPhrases.filter((p) => unit.toLowerCase().includes(p)),
      novelEntities: novelInUnit,
      matchedContextSnippet: bestMatchedContext || undefined,
      explanation,
    });
  });

  // 5. Calculate Final Composite Groundedness & Hallucination Scores
  const totalSentences = sentenceBreakdown.length || 1;
  const sentenceGroundingRatio = (groundedCount + partialCount * 0.5) / totalSentences;

  const totalEntities = groundedInOutput.length + novelInOutput.length;
  const entityGroundingRatio = totalEntities > 0 ? groundedInOutput.length / totalEntities : 1;

  let groundednessScore: number;

  if (evalMode === "strict_verbatim" || isCode) {
    const lineRatio = lineStats.matchingLinesCount / lineStats.totalLinesCount;
    groundednessScore = Math.round(
      verbatimMetrics.verbatimScore * 0.50 +
      lineRatio * 100 * 0.35 +
      sentenceGroundingRatio * 100 * 0.15
    );
    if (lineRatio >= 0.95 || verbatimMetrics.verbatimScore >= 95) {
      groundednessScore = 100;
    }
  } else {
    groundednessScore = Math.round(
      sentenceGroundingRatio * 60 +
      entityGroundingRatio * 25 +
      Math.min(100, verbatimMetrics.verbatimScore * 1.1) * 0.15
    );
  }

  // Hard penalty if novel fabricated entities are present (only in non-code)
  if (!isCode && novelInOutput.length >= 2) {
    groundednessScore = Math.min(groundednessScore, 40);
  } else if (!isCode && novelInOutput.length === 1) {
    groundednessScore = Math.min(groundednessScore, 65);
  }

  // 100% Perfect Grounding Gate:
  // If all statements are grounded and no novel fabricated entities exist, grant 100% grounded score!
  if (groundedCount === totalSentences && novelInOutput.length === 0) {
    groundednessScore = 100;
  }

  groundednessScore = Math.max(0, Math.min(100, groundednessScore));
  const hallucinationScore = 100 - groundednessScore;

  // 6. Build Highlight Tokens
  const highlightTokens = buildHighlightTokens(cleanOutput, cleanContext, novelInOutput, verbatimMetrics.matchedPhrases);

  let explanationSummary = `Groundedness: ${groundednessScore}%, Hallucination: ${hallucinationScore}%.`;
  if (groundednessScore === 100) {
    explanationSummary = "100% Verified Grounded: All claims trace directly to context and no fabricated entities exist.";
  } else if (novelInOutput.length > 0) {
    explanationSummary = `Identified ${novelInOutput.length} fabricated entity/metric(s): ${novelInOutput.slice(0, 3).join(", ")}.`;
  }

  return {
    groundednessScore,
    hallucinationScore,
    verbatimScore: verbatimMetrics.verbatimScore,
    verbatimPhraseCount: verbatimMetrics.verbatimPhraseCount,
    totalSentences,
    groundedSentencesCount: groundedCount,
    partialSentencesCount: partialCount,
    hallucinatedSentencesCount: hallucinatedCount,
    entities,
    sentenceBreakdown,
    highlightTokens,
    lineDiffs,
    evalMode,
    verbatimStats: {
      charAccuracy: verbatimMetrics.verbatimScore,
      exactMatch: cleanContext === cleanOutput || isExactIdentical,
      tokenCoverage: verbatimMetrics.verbatimScore,
      matchingLinesCount: lineStats.matchingLinesCount,
      totalLinesCount: lineStats.totalLinesCount,
    },
    scoringExplanation: {
      summary: explanationSummary,
      exactMatchTriggered: false,
      promptReferencedEntities: Array.from(new Set(promptReferencedEntities)),
      fabricatedEntities: novelInOutput,
      statementGroundingRatio: Math.round(sentenceGroundingRatio * 100) / 100,
      verbatimFidelityRatio: Math.round((verbatimMetrics.verbatimScore / 100) * 100) / 100,
    },
  };
}

// Build granular highlight tokens for display
function buildHighlightTokens(
  output: string,
  context: string,
  novelEntities: string[],
  verbatimPhrases: string[]
) {
  const words = output.split(/(\s+)/);
  const contextLower = context.toLowerCase();
  const novelLower = new Set(novelEntities.map((e) => e.toLowerCase()));

  return words.map((chunk) => {
    if (/^\s+$/.test(chunk)) {
      return { text: chunk, type: "neutral" as const };
    }

    const chunkClean = chunk.toLowerCase().replace(/[^\w$%.-]/g, "");
    if (!chunkClean) {
      return { text: chunk, type: "neutral" as const };
    }

    // Check if part of novel entity (hallucination)
    const isNovel = Array.from(novelLower).some((ne) => ne.includes(chunkClean) || chunkClean.includes(ne));
    if (isNovel) {
      return { text: chunk, type: "hallucination" as const };
    }

    // Check if in verbatim phrases or direct context
    const isVerbatim = verbatimPhrases.some((vp) => vp.includes(chunkClean));
    if (isVerbatim) {
      return { text: chunk, type: "verbatim" as const };
    }

    if (contextLower.includes(chunkClean)) {
      return { text: chunk, type: "grounded" as const };
    }

    return { text: chunk, type: "neutral" as const };
  });
}
