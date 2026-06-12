B"H
# Carrier Cleanup Plan: readManyLines / applyPatch / file ops

Confirmed:
- simulateRuntime explicit node-dom + actionsJson works.
- paged bulkSearch works with nextRequest.
- commandTree content carrier works.
- readManyLines fails with JSON content carrier: missing_ranges.

Likely same weakness:
- applyPatch reads `payload.edits` only if native array.
- mkdirp reads `payload.paths` only if native array.
- processActions args/pids only native arrays.

Plan:
1. Rewrite full `lineBatch.js` to fuse ranges from params/content/body/query/ranges/ranges64 and newline paths.
2. Rewrite full `searchEdit.js` to parse edits from carrier JSON and improve grep deadline/pagination parameters.
3. Rewrite full `fileOpsPaths.js` to parse paths from JSON string/newline/comma carriers.
4. Rewrite full `processActions.js` later if time permits for args/pids.
5. Sync installed copies, run tests, regenerate manifest.
