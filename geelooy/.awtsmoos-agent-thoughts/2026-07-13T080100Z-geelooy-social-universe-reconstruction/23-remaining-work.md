# B"H

Boruch Hashem

Blessed is He

## Remaining Work

The Awtsmoos recreates every unfinished edge as a new invitation to truth. At Awtsmoos.com this list remains the active boundary between a verified repair pass and the larger social-universe reconstruction.

## Priority 1 — Unified route architecture

- Bring `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/post-editor/index.html` into the canonical shell without breaking editor context or direct loads.
- Bring `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichel-editor/index.html` into the canonical shell.
- Bring `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/comment-thread/index.html` into the canonical shell and require honest route context before exposing submission controls.
- Remove duplicate navigation ownership from `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichelos/_awtsmoos.submitToHeichel.html`, which currently produces six navigation landmarks.
- Consolidate route-specific titles and document landmarks across primary routes.

## Priority 2 — Authenticated real-behavior verification

The following require a safe authenticated test identity or explicit non-production fixture so real user data is not mutated accidentally:

- Current/default alias resolution and alias switching.
- Alias creation and profile linking.
- Mail thread selection, composition, send, delete, and mobile thread return.
- Post creation, draft preservation, validation, publish failure, and publish success.
- Heichel creation, editing, governance, submissions, follow state, and ownership controls.
- Comment submission, editing, deletion, and reply threading.
- Notification pagination, search, mark-one, and mark-all behavior.

## Priority 3 — Mobile and accessibility matrix

Run a dedicated live matrix at minimum for 320, 375, 390, 768, 1024, 1280, and 1440 CSS-pixel widths:

- Page-wide overflow and fixed-control occlusion.
- Touch target size and mobile keyboard behavior.
- Heading hierarchy and landmark uniqueness.
- Full keyboard traversal, visible focus, menu escape, and focus restoration.
- Screen-reader names, descriptions, state announcements, and reading order.
- Reduced-motion behavior and animation removal.
- 200% and 400% zoom/reflow.
- High-contrast and forced-colors behavior.
- RTL and mixed Hebrew/English content where routes support it.

## Priority 4 — Mostly single-page enhancement

Only after route ownership is unified:

- Preserve ordinary anchors as the fallback contract.
- Add same-origin enhancement with modifier-click and download exclusions.
- Preserve direct loads, refresh, query strings, hashes, and server fallbacks.
- Implement history, focus, title, scroll, cleanup, cancellation, and repeated-navigation tests.
- Measure memory and listener growth over long navigation sessions.

## Priority 5 — Performance and resilience

- Establish route performance budgets on ordinary phones and laptops.
- Measure cold load, warm load, API latency, long tasks, layout shifts, and transfer size.
- Audit duplicate CSS/design systems and remove only after ownership is proven.
- Add honest offline, timeout, partial-data, and retry states for every primary API surface.
- Verify large real datasets, long titles, missing media, malformed historical records, and slow responses.

## Priority 6 — Test debt

- Repair the broader `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichelos/heichel/modules/test/homeHeichelosUpgradeStatic.test.mjs` failure around the pre-existing missing Home token `data-home-empty-state` after tracing intended ownership.
- Run the complete repository test suite and classify failures as pre-existing, introduced, or environmental.
- Add browser contracts for primary-route headings, landmarks, no-overflow, and reduced-motion.
- Add authenticated integration coverage with isolated disposable data.

## Priority 7 — Browser isolation

- The shared Chrome relay allowed concurrent agents to change the selected target despite session leasing.
- Add or use target-explicit browser actions so evaluation cannot drift to another agent’s game tab.
- Until then, correlate every browser result with its returned URL and discard mismatches.

## Next action

Begin with the unified-shell migration map for post editor, Heichel editor, comment thread, and the duplicate-navigation Create route. Read every involved entry file, module, API contract, and existing test before any complete-file rewrite.
