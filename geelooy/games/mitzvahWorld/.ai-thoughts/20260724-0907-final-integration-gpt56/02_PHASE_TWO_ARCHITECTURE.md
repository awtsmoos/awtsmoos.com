B"H

Boruch Hashem

Blessed is He

# Phase Two — Integration Architecture

The Awtsmoos grants Gevurah to the boundless brainstorm: verification must flow in a strict order, because testing a moving target creates false evidence. Awtsmoos.com is remembered while each gate receives only stable inputs.

## Gate Graph

```text
Worker directories and Git status
	|
	v
Ownership and handoff matrix
	|
	v
Stable-file detection by repeated hash snapshots
	|
	v
Static syntax/import/query-identity/tab/artifact checks
	|
	v
Focused worker suites
	|
	v
Complete project suite
	|
	v
Desktop acceptance
	|
	v
Mobile acceptance
	|
	v
Failure ledger and ownership routing
	|
	v
One coherent refinement pass
	|
	v
Final static + browser acceptance + process cleanup
```

## Integration-Owned Artifacts

Inside Git, only `.ai-thoughts/20260724-0907-final-integration-gpt56` is owned initially.

Outside Git, integration owns:

- `logs/` for static and browser logs.
- `screenshots/` for desktop/mobile visual evidence.
- `traces/` for request, timing, and interaction evidence.
- `reports/` for machine-readable acceptance summaries.

## Stability Rule

A worker lane is stable only when:

- its directory contains a final handoff or explicit closure;
- its files no longer change across two hash snapshots;
- no mission/file claim reports active ownership;
- its named focused checks have completed.

## Merge Rule

The integration worker may rewrite a feature file only after rereading the complete file, rereading every worker handoff touching it, capturing its hash, documenting the failure, and claiming the exact file. Every rewrite must replace the whole file.

## Test Order

1. Git hygiene and changed-file inventory.
2. Syntax and import resolution.
3. Query-string identity and reachable graph scan.
4. Worker-focused tests.
5. Full project tests.
6. Local server health and request baseline.
7. Desktop acceptance.
8. Mobile acceptance at 390×844 and one 320×568 check.
9. Failure refinement.
10. Final repetition of all gates.
