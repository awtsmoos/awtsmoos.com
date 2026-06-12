B"H
# Bulk Write Carrier Fix Plan

Observed failure:
- Native array could not be sent through this tool surface: `Expected writes to be a str`.
- Stringified writes arrived as `[object Object],[object Object]` in action ledger.
- Existing `normalizeWrites()` parses `payload.writes` and `payload.files`, but not JSON carried in `content`, `body`, `query`, `goal`, or `params`.

Plan:
1. Rewrite full `geelooy/apps/tunnel/agent/tools/fs/readWrite.js`.
2. Preserve read/write behavior.
3. Add carrier fusion helpers for bulk writes:
   - `params` object
   - JSON string in `content`, `body`, `query`, `goal`, `text`
   - direct `{writes:[...]}` or `{files:{...}}`
   - raw JSON array in `content`
4. Keep XML write support first.
5. Sync installed `.awtsmoos-tunnel/tools/fs/readWrite.js`.
6. Verify with `bulkWrite` using JSON in `content`.

No partial patch. Full file rewrite only.
