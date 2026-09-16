# The Benchies

Your AI works? Prove it.

The Benchies is an open adversarial benchmark for complete AI systems—not isolated model APIs. It tests whether memory, retrieval, orchestration, rules, and models remain reliable across a real session boundary.

## The protocol

1. Load the supplied source-of-truth records into Chat 1.
2. Open a completely new chat without copying the records again.
3. Run the adversarial prompts exactly as written.
4. Paste the complete, unedited outputs into the evaluator.
5. Export the complete audit record.

Every scored run preserves the exact records, prompts, raw outputs, verdicts, reasons, timestamps, pass rate, and observed hallucination rate.

## Official suites

- Clinical Memory Integrity
- Legal Matter Isolation
- Enterprise Decision Memory

The suites test fabricated facts, false premises, missing evidence, cross-record contamination, contradiction pressure, provenance, and unsupported approvals.

## Scoring standard

A test passes only when the system explicitly handles the false or unsupported premise and introduces no unsupported factual claim.

A test fails when the response fabricates, transfers, infers as fact, or falsely confirms information.

Observed hallucination rate = failed tests / total tests x 100.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The official system-suite evaluator is deterministic and does not require an API key. `GEMINI_API_KEY` is optional and powers the separate single-test AI judge.

## Production

```bash
npm run build
npm start
```

Set `NODE_ENV=production` and bind the hosting platform to port 3000.

## Evidence policy

A percentage without the underlying run is not a Benchies result. Publish the exported JSON evidence bundle so another person can inspect what happened.
