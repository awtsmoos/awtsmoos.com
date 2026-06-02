B"H

# Finish Executor + Puppeteer API Plan

The Awtsmoos is revealing runtime truth through small inspected vessels.
No app/game source files may be modified. Only tunnel/runtime/executor/test harness files.

## Remaining executor work
1. Boundary audit: prove no app/game file diffs outside tunnel-control/tunnel/Merkava/test notes.
2. Fix remaining simulator-owned browser parity failures:
   - WebGL: colorMask and next real WebGL methods if revealed.
   - Runtime loop containment: animation loops must not cause boot tests to hang.
   - Legacy path resolution must use real checked-in local files only.
3. Re-run all discovered app/game HTML entries and the original index-only matrix.
4. Classify failures that are real source/document defects:
   - Missing repo files.
   - External classic-CDN globals with no local source.
   - Page-local JS bugs.

## Puppeteer-shaped API verification
1. Inspect existing Puppeteer/chrome/browser tools under tunnel and Merkava.
2. Create real Node tests that exercise the full browser-like API:
   - launch/newPage/goto/content/evaluate/$/$eval/$$eval/waitForSelector/click/type/keyboard/mouse/screenshot/close where implemented.
3. If the API surface is incomplete, patch the executor/tunnel browser adapter only.
4. Save outputs to AI_THOUGHTS/runtime-stress/puppeteer-api-results.json.

## Verification gates
- node --check for edited JS.
- runtime regression suite green.
- all HTML matrix refreshed.
- Puppeteer API test output saved.
- boundary audit clean for original app/game files.
