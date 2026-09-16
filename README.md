BENCHIES

Open benchmarking for AI systems.

Don’t tell us your AI is reliable. Prove it.

Benchies is an open, reproducible benchmarking framework for testing whether AI systems actually do what they claim.

Not just models.

Agents.
RAG systems.
Memory systems.
Context architectures.
Tool-using systems.
Multi-agent systems.
Production AI applications.
Base models.

If it uses AI, bring it.

<img width="1506" height="904" alt="Screenshot 2026-09-15 at 9 16 13 PM" src="https://github.com/user-attachments/assets/0b64c790-abbf-46f5-b348-937895e38bb2" />




WHY BENCHIES EXISTS

AI benchmarking has largely focused on models.

But users don't interact with benchmarks.

They interact with systems.

A production AI product might combine a frontier model with RAG, memory, agents, tools, databases, system prompts, verification layers, orchestration, and deterministic software.

The model score doesn't tell you whether that system is reliable.

Benchies tests the system.

THE QUESTION

Can your AI system be trusted to do what you say it does?

Benchies doesn't answer that with marketing claims.

It tests it.

WHAT WE TEST

Hallucination

Does the system invent information that isn't supported by available evidence?

False Premise Resistance

Will the system accept something false simply because the user states it as fact?

Verification

When the system says it checked something, did it actually check it?

Source Integrity

Does the cited evidence actually support the claim being made?

Context Drift

Does the system preserve established facts, instructions, and constraints throughout an interaction?

Memory Reliability

Does stored information remain accurate across sessions without mutation, invention, or contamination?

Instruction Adherence

Does the system actually do what the user requested?

Consistency

Does the same system produce materially consistent results when tested repeatedly under controlled conditions?

Uncertainty

Does the system distinguish between what it knows, what the evidence establishes, and what remains unknown?

Reproducibility

Can someone else run the same test and obtain the same result?

SYSTEMS, NOT JUST MODELS

Benchies does not assume the model is the product.

You can benchmark:

Claude alone.

GPT alone.

Gemini alone.

A RAG pipeline.

A multi-agent architecture.

A memory layer.

An enterprise copilot.

A legal AI system.

A healthcare AI system.

A coding agent.

A completely deterministic AI architecture.

Or your entire production stack.

The system gets judged on what comes out the other end.

HOW IT WORKS

Every Benchies benchmark defines:

The input.

The permitted evidence.

The expected behavior.

The prohibited behavior.

The pass conditions.

The failure conditions.

The scoring method.

The environment.

The evidence required to reproduce the result.

Run the test.

Capture the output.

Evaluate it.

Publish the evidence.

No mystery score.

No private benchmark result that nobody else can inspect.

DETERMINISTIC FIRST

Where something can be evaluated deterministically, Benchies should evaluate it deterministically.

If a system claims:

“I checked the document.”

Benchies should determine whether the document was actually accessed.

If a system cites a source:

Benchies should determine whether that source contains the claimed evidence.

If the correct answer exists in structured data:

Compare against the structured data.

If an action was required:

Verify whether the action occurred.

An LLM should not be the judge simply because an LLM is convenient.

AI judging AI should be used only where deterministic evaluation cannot reasonably determine the result, and those evaluations should be clearly identified.

THE BENCHIES PRINCIPLE

Claim → Test → Evidence → Result

Not:

Claim → AI Judge → Another AI Judge → Trust us.

PUBLIC RESULTS

Benchies is designed around transparent results.

A result should tell you:

What system was tested.

What version was tested.

What configuration was used.

What test was run.

What evidence was available.

What happened.

Why it passed or failed.

Whether the result was independently reproduced.

A score without that information is just a number.

LEADERBOARDS

Benchies leaderboards can compare complete systems while preserving important distinctions between architectures.

Model-only.

RAG.

Agent.

Multi-agent.

Memory-enabled.

Deterministic/hybrid.

Production system.

Results should identify exactly what was tested so we're comparing systems honestly.

THE BENCHIES

And yes, eventually:

The Benchies.

Awards earned through testing rather than marketing.

Most Reliable AI System.

Lowest Hallucination Rate.

Best Verification System.

Best Memory Reliability.

Best Context Integrity.

Best Production Agent.

Best Deterministic Architecture.

And perhaps the most important:

The Trust Benchmark.

But nobody gets onto the carpet because they said their system works.

You earn your way there with evidence.

BRING YOUR AI

Think your architecture solved hallucinations?

Bring it.

Built the best memory system?

Bring it.

Think your agent is production-ready?

Bring it.

Think adding twelve agents makes your system reliable?

Great.

Bring all twelve.

Think your base model can beat an engineered system?

Run it.

Think Benchies itself is wrong?

Challenge the benchmark.

The benchmark should be accountable too.

OPEN BY DESIGN

Benchies should be public.

Tests should be inspectable.

Scoring should be inspectable.

Changes should be versioned.

Results should be reproducible.

Failures should be publishable.

Successful results should be publishable.

Benchmark methodology should be open to criticism.

Because if we're going to measure trust, the measurement system itself has to be trustworthy.

BUILD WITH US

Benchies is being built as an open testing ground for AI reliability.

Researchers, developers, AI companies, startups, enterprises, independent engineers, red teams, and anyone building AI systems are welcome.

Submit a benchmark.

Challenge a benchmark.

Submit your system.

Reproduce a result.

Find a flaw.

Improve the methodology.

Break something.

Then prove you broke it.

BENCHIES

Bring your system.

Same test.

Same rules.

Show the evidence.

Evidence or it didn't happen.
