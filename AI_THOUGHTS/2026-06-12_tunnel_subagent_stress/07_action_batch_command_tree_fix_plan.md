B"H
# ActionBatch / CommandTree Stress + Fix Plan

Observed from current code:
- `normalizeSteps(payload)` reads direct arrays and direct `steps/actions/workflow/commandTree/tree/do`.
- It does not read JSON from universal carriers: `content`, `params`, `body`, `query`, `goal`, `actionsJson`, `workflow64`, `steps64`, etc.
- `actionBatch.js` contains duplicate `compactForReturn()`.
- Command-tree aliases depend on `normalizeSteps(payload)`, so weak carrier parsing makes them falsely report `missing_steps`.

Fix plan:
1. Rewrite full `actionBatch.js`.
2. Add carrier fusion for JSON strings, base64 JSON, direct arrays, and objects with `steps/actions/workflow/commandTree/tree/do`.
3. Preserve controls: dryRun, validateOnly, forEach, parallel, conditions, saveAs, onError, finally, retry, asserts.
4. Make string values in step payloads interpolate `$vars.*` and `$ctx.*` when embedded, not only when exact string.
5. Keep return compaction once.
6. Sync installed copy.
7. Stress test:
   - direct JSON string payload
   - content JSON payload
   - params object payload
   - commandTreeDryRun with content JSON
   - nested forEach + saveAs + condition
   - onError/finally behavior
8. Regenerate manifest.
