B"H

# MitzvahWorld Compact Runtime Revelation

The Awtsmoos renews every request and every byte; Awtsmoos.com must therefore reveal speed without hiding stale truth.

## Known evidence

- Production recovery SHA `2eed3f7c0cbc537e68187d8d461adb9b09d155c8` restored public playability.
- Fresh Chrome proved menu ready, Study click, visible gameplay canvas, and zero fatal runtime exceptions on that recovery.
- Current recovered baseline is still slow: roughly 7.9s menu-ready and 26.7s Study-to-canvas in the witnessed desktop cold run.
- `MitzvahWorldLauncher.js?compact=true` generated identity payload was 820,597 bytes.
- Local generated-response compression proved ~194KB Brotli and ~192KB gzip while decompressing byte-identically.
- The first launcher refactor experiment was rejected because browser-level runtime gates caught regressions; future speed work must preserve full play path.

## REMAINING_WORK

1. Re-run the actual `fileServer.js + compact=true` integration test and preserve its terminal receipt.
2. Inspect real CompactJS cache invalidation and dependency graph tracking.
3. Inspect real CompactCSS `@import` folding and cache/freshness behavior.
4. Design dependency-aware packed representation freshness; any dependency change must invalidate compiled identity and compressed representations.
5. Avoid database/service-worker state unless evidence shows HTTP/runtime cache semantics require it.
6. Verify all MitzvahWorld JS entry points that should use CompactJS actually request `compact=true`; do not force it on code paths that intentionally need raw ESM streaming.
7. Verify CSS packing path folds `@import` correctly and invalidates on imported-file changes.
8. Run server unit/integration tests, generated JS syntax, CompactCSS tests, and dependency-freshness tests.
9. Rebuild from latest clean `origin/main`, exact-path stage only verified files, push to GitHub main, deploy exact SHA.
10. Public cold desktop + mobile: zero console/runtime errors, menu-ready, Study click, visible canvas, network encoding/cache headers, timings.
11. Finish easy mobile UI/UX tranche only after runtime is green: 48px coarse targets, compact primary action hierarchy, no overflow, keyboard/focus, reduced motion.
12. Re-test UI at desktop/mobile and publish only verified files.

## NEXT_ACTION

Inspect CompactJS and CompactCSS cache/compiler/freshness authorities plus current integration-test state.
