B"H

# Ownership and idempotency implementation plan

Implement every finding from bulkread audit.

Files to rewrite fully:
- geelooy/style/heichelos/heichel/hero.css: hero only, no topbar, no stats duplicate.
- geelooy/style/heichelos/heichel/search.css: search only, no series-heading duplicate.
- geelooy/style/heichelos/heichel/bottom-nav.css: bottom nav only, no bulk bar duplicate.
- geelooy/style/heichelos/heichel/series-list.css: compatibility wrapper to split card modules.
- geelooy/style/heichelos/heichel/mobile.css: compatibility wrapper to responsive.css.
- geelooy/style/social/home/beauty/atmosphere/pointer-light.css: actual CSS using --home-pointer-x/y.
- geelooy/style/social/home/beauty/atmosphere/index.css: import pointer-light.
- geelooy/heichelos/post/logic/beauty/currentSectionTracker.js: idempotent bind.
- geelooy/heichelos/post/logic/beauty/progressSpine.js: marker signature cache.
- geelooy/heichelos/post/logic/beauty/index.js: reuse cleanup/state.
- geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js: throttle/cache expensive scan.
- geelooy/heichelos/post/postLogic.js: run blocker-heavy diagnostics less often.
- geelooy/heichelos/heichel/modules/beauty/index.js: return existing state instead of overwriting.

Tests to create/rewrite:
- geelooy/style/test/heichelNoDuplicateOwnership.test.mjs
- geelooy/style/test/homePointerContract.test.mjs
- geelooy/heichelos/post/logic/beauty/test/idempotency.test.mjs

After writes:
- Run all old/new tests.
- Run node --check for changed JS.
- No live visual inspection, but test and file verification.
