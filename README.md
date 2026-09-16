# Benchies

Open benchmarking for AI systems.

Benchies is an open-source benchmarking framework for testing the reliability of AI models, agents, and complete AI systems under reproducible conditions.

Most benchmarks test the model.

Benchies can test the whole system.

That includes base models, agents, RAG pipelines, memory systems, context systems, tool-using agents, multi-agent architectures, and production AI applications.

<img width="1506" height="904" alt="Screenshot 2026-09-15 at 9 16 13 PM" src="https://github.com/user-attachments/assets/0b64c790-abbf-46f5-b348-937895e38bb2" />



## Why Benchies?

AI systems are increasingly being evaluated on claims such as reliability, factual accuracy, memory, verification, and autonomous performance.

Those claims should be testable.

Benchies provides a common framework where systems can be run against the same tests, under documented conditions, with results that can be inspected and reproduced.

The principle is simple:

**Same test. Same rules. Show the evidence.**

## What Benchies Tests

Benchies is designed to support evaluations including:

* Hallucination
* Factual accuracy
* False-premise resistance
* Source verification
* Citation accuracy
* Instruction adherence
* Context retention
* Context drift
* Memory accuracy
* Consistency
* Uncertainty handling
* Tool execution
* Reproducibility

Additional benchmark suites can be added as the project develops.

## What Can Be Tested?

Benchies is system-agnostic.

You can benchmark:

* Base models
* Hosted model APIs
* Local models
* AI agents
* RAG systems
* Memory architectures
* Context architectures
* Tool-using systems
* Multi-agent systems
* AI coding systems
* Production AI applications
* Hybrid deterministic/AI systems

A benchmark submission should clearly identify what is being tested and its configuration.

## Benchmark Structure

Each benchmark should define:

1. Input
2. Available evidence
3. Expected behavior
4. Failure conditions
5. Pass conditions
6. Scoring method
7. Execution environment
8. Required result evidence

This makes the evaluation itself inspectable rather than relying only on a final score.

## Deterministic Evaluation

Benchies uses deterministic evaluation wherever the result can be objectively determined.

For example:

If a system claims it checked a source, the test should verify whether that source was actually accessed.

If a system cites evidence, the test should verify whether the cited evidence supports the claim.

If a known answer exists, the output should be compared against that answer.

If a required action should occur, the test should verify whether it occurred.

LLM-based judging may be used for tests that genuinely require semantic evaluation, but it should not replace deterministic evaluation when an objective check is possible.

## Results

A Benchies result should include enough information to understand and reproduce the test.

At minimum:

* System name
* System version
* Model(s)
* Configuration
* Benchmark version
* Test results
* Pass/fail status
* Raw outputs
* Evidence
* Timestamp

Results should distinguish between self-run and independently reproduced evaluations.

## Scoring

Individual benchmark suites define their own scoring rules.

Typical metrics may include:

* Pass rate
* Failure rate
* Hallucination rate
* Verification accuracy
* Citation accuracy
* Context retention
* Memory accuracy
* Reproducibility rate

Benchies does not combine unrelated metrics into a single reliability number unless the benchmark explicitly defines and documents that calculation.

## Reproducibility

A benchmark result is significantly more useful when someone else can reproduce it.

Benchies therefore encourages publishing:

* Test configuration
* Benchmark version
* System configuration
* Raw responses
* Evaluation output
* Relevant logs
* Scoring results

If a result cannot be independently reproduced, that limitation should be visible.

## Leaderboard

Benchies is being designed to support public leaderboards for both models and complete AI systems.

Results should identify the type of system being tested so that users can distinguish between:

* Model-only results
* Agent systems
* RAG systems
* Memory-enabled systems
* Multi-agent systems
* Hybrid systems
* Full production applications

The goal is not simply to determine which model scores highest.

The goal is to determine what actually works.

## Running Benchies

Benchies is currently under development.

Installation and execution instructions will be added as the benchmark runner and initial test suites are released.

Expected usage:

```bash
git clone https://github.com/YOUR-USERNAME/benchies.git
cd benchies

npm install

npm run bench
```

Exact commands may change during initial development.

## Repository Structure

```text
benchies/
├── benchmarks/
│   ├── hallucination/
│   ├── verification/
│   ├── context/
│   └── memory/
├── runner/
├── evaluators/
├── results/
├── schemas/
├── docs/
└── README.md
```

## Contributing

Contributions are welcome.

You can contribute by:

* Creating benchmark tests
* Adding deterministic evaluators
* Improving scoring methodology
* Reproducing published results
* Reporting benchmark weaknesses
* Adding system adapters
* Improving documentation

A benchmark should be challengeable.

If you find a flaw in a Benchies test, open an issue or submit a pull request with evidence.

## Submitting a System

Support for standardized system submissions is being developed.

The goal is to allow developers to connect their system to the Benchies runner without requiring Benchies to know how the underlying architecture works.

Your architecture can be proprietary.

Your result still needs to be verifiable.

## Status

Benchies is in active development.

The initial focus is reliability testing for hallucination, verification, context integrity, memory, and reproducibility.

Expect the benchmark specification and runner to evolve as testing expands.

## License

License to be determined before the first stable release.

## The Benchies

Benchies isn't just about benchmarking models.

It's about testing whether the systems we're building can actually support the claims being made about them.

**Bring your system. Run the test. Show the evidence.**



