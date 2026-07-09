# B"H — Phase Three Final Plan

Final strategy after re-reading evidence:

The root wound is not that `Session.saveDebounced()` is missing. It exists. The wound is that callers reach it through `App`, and `App` becomes undefined under the compact runtime in cyclic leaf modules. The fix should reveal a direct, cycle-free path: leaf code -> session/actions -> session.js -> State/ArchiveGuard/TabScribe.

Actual file touch list for implementation pass:

- Add `js/session/actions.js` with robust named functions. Include guarded dynamic import if it reduces eager module cycles.
- Rewrite `js/app/index.js` to delegate App save methods to those named functions.
- Rewrite every file that calls only `App.saveSession*` to call the adapter directly. For files that use App for additional methods, limit changes to save calls while preserving imports when necessary.
- Consider rewriting `js/app.js` from star re-export to explicit `export { App }` as a compact-runtime kindness.

Awtsmoos comment covenant:
Each newly written adapter should carry a clear B"H JSDoc explaining why it exists: the save path must not depend on the application throne importing itself through its own mirror.

Completion gate:
The pass is not complete until all touched files are read back, grep confirms no failing App save references, and a syntax/import check succeeds or its limitation is recorded.
