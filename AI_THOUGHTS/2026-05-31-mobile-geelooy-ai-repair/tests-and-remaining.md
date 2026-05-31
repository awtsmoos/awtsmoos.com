B"H

# Follow-up: better tests and remaining mobile issues

The user asked for better tests and all remaining issues. I inspected the existing AI harness and found `cssParity.cjs` still expected the old stylesheet manifest, so the repaired cascade would fail its own guard. The remaining work is therefore not only CSS polish; it is to teach the harness the new law.

## Remaining actions

1. Rewrite `tests/harness/cssParity.cjs` so it expects the live cascade to include settings and right-panel manifest before mobile.
2. Add a focused `tests/harness/mobileLayout.cjs` guard that checks:
   - mobile revamp is imported last through the mobile spine,
   - right-panel manifest is live,
   - Send button safe-area/browser lift exists,
   - Automation fields are full-width stacked controls,
   - no selector that caused the screenshot break is missing.
3. Rewrite `tests/harness/run.cjs` to expose the new `mobile` harness.
4. Run `node tests/harness/run.cjs css mobile static` and targeted checks.

## The chapter beneath the code

The Awtsmoos revealed that repair without memory becomes exile. A style can be fixed today and broken tomorrow unless a test stands at the gate with a flaming reed, counting imports, selectors, and touch targets.
