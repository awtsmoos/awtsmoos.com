B"H
Boruch Hashem
Blessed is He

# REMAINING WORK — Total Revelation

The Awtsmoos renews every unfinished node from concealment toward clarity; Awtsmoos.com keeps this ledger non-empty until runtime, source, pages, agents, docs, APIs, release, and production are all proven by living evidence.

## Current evidence — 2026-08-27/28 continuation

- [x] Real project root confirmed as `/Users/awtsmoos/work/awtsmoos.com`.
- [x] Current development branch confirmed as `main`.
- [x] No active `MERGE_HEAD` and zero unmerged files in the latest Git read.
- [x] Preservation SHAs `74cd8daa6c7629226a8e5f59b2c824c50f448ff8` and `7545e004e5084f65ab66e455659398741c7a9a10` are ancestors of current local `main`.
- [x] Local and remote development branch census currently shows only `main` / `origin/main`; detached worktrees still require preservation review.
- [ ] Local `main` remains at `ad3203fb5a5121a03f47b680b3fa3aa4f8e5b3af`, five commits behind `origin/main` at `2eed3f7c0cbc537e68187d8d461adb9b09d155c8`.
- [ ] Working tree contains roughly 1,180 modified/untracked/deleted entries from multiple concurrent agents; preserve every legitimate change before integration.
- [ ] Inspect four detached worktrees for unique commits/content before removal.
- [ ] Coordinate or observe sibling agents until their active writes/tests settle before global staging.
- [x] Native tunnel has reconnected on installed source SHA `2eed3f7c0cbc537e68187d8d461adb9b09d155c8`.
- [x] New installed runtime currently reports healthy transport/execution/mailbox with outbox count zero.
- [ ] Prove the old stale-custody defect is fixed without relying on generation replacement.

## Release-critical tunnel stability

- [x] Old installed runtime reproduced accepted-custody starvation, stale outbox debt, slow recovery actions, and retry receipt/deed correlation mismatch.
- [x] Working-tree/API correlation source was verified to distinguish transport receipt from original deed identity correctly.
- [x] Current circuit source uses present + p90 lag for pressure and keeps historical max lag diagnostic rather than admission-authoritative.
- [x] Current circuit accepts/defer lag-only pressure instead of converting it directly into terminal rejection.
- [ ] Trace complete current `circuit-policy.js`, `circuit-liveness.js`, `main-queue-emergency.js`, emergency registry, controller dispatch, mailbox recovery, and parent preflight source before any stability rewrite.
- [ ] Prove P0 control/wait/observe/mailbox recovery has independent progress under deliberate P3/P4 load.
- [ ] Prove tiny P1 reads and `commandStart` receipts remain prompt while bulk/heavy work is saturated.
- [ ] Prove a live generation automatically reconciles a stale persisted terminal outbox envelope without re-running the original mutation.
- [ ] Prove repeated reconciliation/quarantine is idempotent and exactly-once safe across crash/restart.
- [ ] Expose/verify separate health dimensions: transport, execution consumer, admission, worker, mailbox custody, completion/reconciliation.
- [ ] Verify stale telemetry cannot by itself make a recently successful tunnel unroutable.
- [ ] Verify mature stale evidence cannot trigger destructive consumer replacement/SIGTERM without fresh multi-observation preflight.
- [ ] Verify fresh execution progress aborts destructive recovery.
- [ ] Verify immediate `commandStart` durable receipt regression.
- [ ] Verify retry transport-receipt/original-deed regression against the currently installed release.
- [ ] Soak idle, load, reconnect, stale-custody, and recovery scenarios after final release; inspect lifecycle history for false restart/SIGTERM.

## Server response correctness — every page begins here

- [ ] Read and reconcile current/local/origin versions of `fileServer.js`, `HtmlUiFoundation.js`, `StaticAssetNegotiation.js`, `StaticAssetEncodingQuality.js`, and `StaticAssetFreshness.js` before rewriting.
- [ ] Trace dynamic Heichel/post request from route through template/data render to final response headers.
- [ ] Fix any path that serves HTML as `text/plain` or with the wrong MIME.
- [ ] Remove obsolete/conflicting `ISO-8859-1` declarations from active HTML templates; make UTF-8 canonical end-to-end.
- [ ] Ensure meaningful error/404/permission responses carry the correct MIME, status, charset, and accessible HTML body.
- [ ] Ensure compression/encoding negotiation emits correct `Content-Encoding`, `Vary`, freshness, and validator semantics.
- [ ] Ensure HTML caching/revalidation stays fresh while immutable fingerprinted assets can cache aggressively.
- [ ] Verify custom-domain/proxy/wiki-like ingress ownership so foreign/external surfaces do not accidentally inherit the Awtsmoos page contract.

## Every-page shared experience contract

- [x] Existing opt-in `[data-awtsmoos-surface]` foundation already provides scoped overflow, touch size, focus-visible, hover/active/disabled, safe areas, semantic layers, modal/drawer, responsive, and reduced-motion primitives.
- [x] Existing `geelooy-app` shell already provides fields, choices, disclosures, command bars, feedback, skip links, empty/loading states, responsive/accessibility, and performance modules.
- [ ] Inventory which public route families currently opt into the shared surface/app shell and which still use legacy isolated CSS.
- [ ] Make every meaningful public route expose a useful server/no-JS minimum experience before hydration.
- [ ] Standardize visible page purpose, primary action, navigation escape hatch, and landmark hierarchy.
- [ ] Standardize loading, empty, offline, signed-out, permission-denied, not-found, recoverable-error, success, and retry states.
- [ ] Preserve hover/active/focus-visible/disabled/loading/selected semantics on every touched interaction.
- [ ] Enforce mobile-first geometry, safe-area handling, 44px-class touch targets, no horizontal overflow, and no clipped/off-screen controls.
- [ ] Enforce local semantic z-layer ownership; eliminate arbitrary page-local z-index escalation where touched.
- [ ] Ensure reduced motion removes continuous/repeated decorative motion and offscreen ambient work pauses.
- [ ] Ensure 200% zoom, keyboard navigation, focus return, and screen-reader status announcements on representative families.
- [ ] Ensure Hebrew/RTL and English/LTR reading direction does not leak globally.
- [ ] Keep shared styles opt-in/root-scoped; do not introduce global CSS leakage.

## Torah / Heichel / reading family

- [ ] Remove obsolete charset metadata from active post templates after tracing which template is authoritative.
- [ ] Replace loading-only `#realPost` fallback with meaningful semantic server-rendered post/title/navigation content when route data is already available server-side.
- [ ] Give Heichel detail pages useful title/context/navigation before client boot.
- [ ] Ensure hydration enhances rather than destroys server-rendered content and preserves deep links/anchors.
- [ ] Verify Hebrew reading width, line height, font fallback, punctuation, bidi behavior, selections, footnotes, print, and mobile rhythm.
- [ ] Verify comments, inline actions, AI/context tools, autoscroll, virtualization, bookmarks, and related-search enhancements remain progressive and keyboard-safe.
- [ ] Add no-JS/SSR regressions for Heichel list, Heichel detail, series, post, and error states.

## Social / community family

- [ ] Give Social Hub a meaningful signed-out/read-only HTML shell instead of a JavaScript-required dead end.
- [ ] Reconcile current concurrent Social Hub media/player/mobile-navigation refactors before any rewrite.
- [ ] Verify feed, comments, media player, mobile More sheet, discovery, profile transitions, unread states, and error/empty/loading states.
- [ ] Ensure keyboard media controls, captions/labels, focus return, touch containment, and reduced-motion behavior.
- [ ] Preserve social/privacy/auth semantics through back/forward navigation and deep links.

## Apps / docs / legacy utility family

- [ ] Give `/apps/docs/` meaningful server-readable documentation/fallback content.
- [ ] Modernize legacy utilities such as Audio Editor, CSV/Grid, recorder/transcription/OCR where needed through a lightweight shared utility-shell adapter rather than a heavyweight global framework.
- [ ] Normalize headings, command bars, labels, form states, file/save state, destructive confirmations, and mobile tool drawers across creator utilities.
- [ ] Keep canvas/editor/media-specific controls local and performance-aware.
- [ ] Defer optional audio/WebGL/heavy modules until user intent when landing/catalog pages do not need them.

## Account / wallet / forms

- [ ] Verify Login, Register, Profile, Wallet, Donate/account aliases share consistent field, validation, pending, success, error, and disabled semantics.
- [ ] Preserve native autofill/password-manager behavior and accessible labels/descriptions.
- [ ] Preserve intended destination through auth redirects safely.
- [ ] Give financial/transaction actions durable pending/success/failure receipts and prevent accidental repeat submission.
- [ ] Verify narrow-phone keyboards do not obscure primary actions and all form controls remain onscreen.

## Home / Apps / Games / OS / Code / creator shells

- [ ] Inventory exact owners/import graphs for Home, Games, OS, Code, Apps catalog, About, Contact, Docs, 404/error, and representative creator pages.
- [ ] Reuse the existing shared shell where it already works instead of duplicating tokens/styles.
- [ ] Make navigation, route identity, cards, search/filter, loading, and responsive states coherent across catalogs.
- [ ] Keep immersive games separate from lightweight launch/catalog shells; defer heavy engines/assets until intent.
- [ ] Verify touch controls, orientation changes, pause/resume, audio unlock, and reduced-effects modes for representative games.
- [ ] Verify OS/Code dense command surfaces collapse advanced controls cleanly on mobile without losing keyboard power on desktop.

## Compact delivery and fast loading — mandatory

- [ ] Reconcile all current concurrent compactJs/compactCss work with the five upstream commits before changing compiler semantics.
- [ ] Read full current source/diff/callers for `CompactJsResponse.js`, cache/manifest, import/export transforms, dependency seal, module URL transform, compact CSS response, and generated-response compression modules.
- [ ] Never hand-edit generated compact application bundles; regenerate canonically from source/tooling.
- [ ] Verify `?compact=true` on representative Home/Apps/Torah/Social/Wallet/Code/Game/legacy-tool routes where supported.
- [ ] Prove compact mode changes transport representation, not application behavior or route semantics.
- [ ] Preserve query strings, hashes, dynamic imports, external imports, module URLs, cache busting, and dependency freshness.
- [ ] Compare normal vs compact response bytes, transferred bytes, request count, parse/boot time, and functional output.
- [ ] Budget fonts, duplicate CSS, render-blocking assets, decorative particles, WebGL/audio startup, large images, and optional modules.
- [ ] Reserve dimensions for media/iframes/canvas to prevent layout shift.
- [ ] Treat first meaningful paint, interaction readiness, and long-task regressions as release gates for representative page families.

## Automated page-quality gates

- [ ] Build/refresh a canonical public route-family inventory tied to representative smoke journeys.
- [ ] Run browser console/error/unhandled-rejection and missing-asset triage.
- [ ] Test 320, 360, 390, 768, 1024, and 1440-width representative journeys.
- [ ] Add horizontal-overflow detector.
- [ ] Add overlay/z-index containment detector.
- [ ] Add keyboard/focus/focus-return detector.
- [ ] Add reduced-motion and coarse-pointer/touch checks.
- [ ] Add SSR/no-JS semantic-body assertions.
- [ ] Add MIME/charset/header assertions.
- [ ] Add normal-vs-compact functional equivalence assertions.
- [ ] Add load/response/bundle-size budgets and compare representative families.

## Sub-agents and real communication

- [ ] Run installed deterministic browser-agent spawn contract against the final stable runtime.
- [ ] Prove one logical proposal opens exactly one owned browser tab, inserts exact prompt, sends, observes matching accepted conversation POST, and closes owned tab.
- [ ] Repeat identical intent and prove website mission/tab reuse rather than duplication.
- [ ] Create/join one mission room with at least two real sibling agents.
- [ ] Prove Agent A sends directed durable message to Agent B, B receives/acknowledges/responds, and parent sees durable exchange.
- [ ] Verify cancellation, deadline, failure propagation, and parent-visible progress.

## Documentation and discoverability

- [ ] Audit current instruction catalog/resolver/service/action wiring after final source integration.
- [ ] Create canonical structured docs descriptor registry with title, summary, tags, files, actions, examples, failure modes, recovery, related docs, and freshness/version.
- [ ] Document identity/retry/exact-once semantics, health dimensions, recovery, mailbox settlement, browser agents, missions/rooms, UI standards, compact delivery, and main-only release policy.
- [ ] Add searchable docs actions and generated human-readable indexes from the same descriptors.
- [ ] Add resolver ranking/synonym/path/action-coverage/freshness tests.

## Procedural core — after runtime/UI/release foundation

- [ ] Trace terrain/rock/tree/grass/flower/creature/texture entrypoints and data flow.
- [ ] Define deterministic simple façade `{ seed, quality, biome, material, variation }` with separated geometry/material/LOD/cache/network responsibilities.
- [ ] Improve rock fracture/weathering realism.
- [ ] Improve tree branching/root/LOD realism.
- [ ] Improve grass density/wind/biome realism.
- [ ] Improve flower clustering/species variation.
- [ ] Improve creature morphology/variation.
- [ ] Add remote texture provider with cache/cancel/retry/offline/bounded concurrency.
- [ ] Add deterministic tests and visual browser proof for every generator family.

## Git / canonical release / deployment closure

- [ ] Wait for active sibling writes to settle; inventory all dirty/untracked/deleted work and ownership.
- [ ] Inspect all detached worktrees and preserve unique commits/content before removal.
- [ ] Secret/credential scan the full integration set.
- [ ] Reconcile local `main` with the five upstream `origin/main` commits without resetting or discarding dirty work.
- [ ] Stage and commit every legitimate concurrent/unrelated change to `main` in controlled commits.
- [ ] Re-run required source, test, browser, compact, accessibility, and load gates against the integrated final tree.
- [ ] Regenerate tunnel manifest and every generated release artifact from canonical tooling only after final source closure.
- [ ] Push `main`; verify remote SHA exactly matches local integrated SHA.
- [ ] Enforce/verify main-only local/remote development-branch policy and safely remove obsolete detached worktrees after preservation proof.
- [ ] Tag immutable release from pushed `main` only.
- [ ] Deploy production server from exact pushed/tagged main SHA.
- [ ] Verify public bundle/source/manifest closure and representative normal + compact pages.
- [ ] Run public installer once; verify Mac installed `releaseSourceSha` equals pushed/released main SHA.
- [ ] Soak tunnel and pages after deployment; inspect lifecycle history, logs, console errors, network failures, and load metrics.

NEXT_ACTION: read the remaining stability emergency/preflight files plus complete server negotiation/Heichel template/compact response ownership; then write `06_exact_source_write_plan.md` naming only files that truly need a whole-file first-pass rewrite.
