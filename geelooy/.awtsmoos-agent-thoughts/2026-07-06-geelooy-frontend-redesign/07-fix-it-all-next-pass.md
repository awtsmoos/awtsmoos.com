B"H

# Next pass: fix it all step by step

The previous pass repaired the targeted visual contracts. This pass widens the circle:
1. Run the full style contract suite.
2. Run all nearby Geelooy social/page contracts that do not require external services.
3. Inspect each failure from actual output.
4. Rewrite whole files only for the failing surfaces.
5. Re-run until the selected suites are green.
6. Finish with syntax checks and a diff summary.

Guardrails:
- No partial patching.
- Read failing files before rewrite.
- Keep modules small where new files are needed.
