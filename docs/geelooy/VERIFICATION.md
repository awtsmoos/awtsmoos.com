B"H
# Geelooy Verification

## Runtime structure audit
`node geelooy/tools/runtime-audit/cli.mjs --output=<report.json>`

The maintained auditor owns disposable Chrome targets, hard-times every HTTP/WebSocket/CDP operation, navigates once per product, emulates 1440/430/375/320 widths, checks overflow/required selectors/runtime/local-network failures, verifies reduced-motion emulation, and classifies infrastructure failures separately from product failures.

Use `--product=Mail` or another configured name for isolated diagnosis.

## Visual reference capture
`node geelooy/tools/runtime-audit/visualCli.mjs --output=<manifest.json>`

This creates reference PNGs for configured products/viewports plus a JSON manifest. These are review artifacts, not brittle pixel-perfect release blockers.

## Quality audit
`node geelooy/tools/quality-audit/cli.mjs --output=<report.json>`

The quality audit uses tracked source and excludes protected user work. It reports:
- source line/compression risks;
- selected CSS performance/scroll risks;
- apparently-unreferenced generation candidates.

Reference findings are review candidates, never automatic deletion commands. Before deleting a generation, verify CSS imports, HTML/script references, server-template composition and runtime ownership.

## Completion gates
1. focused tests for changed behavior;
2. affected broad suites;
3. JS/template syntax witnesses;
4. import graph/style budget;
5. `git diff --check`;
6. no mission temp remnants;
7. HTTP route health;
8. runtime audit;
9. protected-path overlap review;
10. final plan-vs-actual and handoff records.
