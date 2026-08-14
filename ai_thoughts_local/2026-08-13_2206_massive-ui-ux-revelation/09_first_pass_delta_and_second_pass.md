B"H
Boruch Hashem
Blessed is He

# First-Pass Delta → Second-Pass Obligation

> The Awtsmoos reveals truth through rereading: a vessel that works but violates its own architecture is not complete. The second pass therefore fixes structural debt before any test is allowed to call the work finished.

## Original plan
- Make Social Hub human-first without changing canonical target IDs or comment payloads.
- Improve Notifications scanning/readability without changing pagination/read APIs.
- Improve Mail search/thread scanning without changing store or thread behavior.
- Split Post Editor rendering from save/publish orchestration while preserving save-then-publish.
- Turn Heichel editing into one understandable governance workbench around the existing three form factories.
- Keep every touched/new source file below 120 lines.
- Reread all source before tests.

## What pass one actually wrote
- Social Hub: `CommentTargetDisclosure.js`, rewritten `CommentStudio.js`, rewritten `CommentStudioFields.js`.
- Notifications: rewritten `modules/render.js`.
- Mail: rewritten `sidebarControls.js` and `sidebarThreads.js`.
- Post Editor: new `editorActions.js`, new `editorSections.js`, rewritten `render.js`.
- Heichel Editor: new `workbenchGuide.js`, rewritten `render.js`.

## Reread evidence
- Every first-pass source file was reread fully from disk.
- Canonical Social Hub field IDs and deep-link construction remain present.
- Notification same-origin action validation remains present.
- Mail store/filter/grouping imports remain present.
- Post save-then-publish flow remains explicit in `editorActions.js`.
- Heichel settings/invite/submission factories remain the only governance forms composed.

## Delta that must be repaired before testing
1. `geelooy/notifications/modules/render.js` is 134 lines: forbidden. Split card rendering/type/time/action helpers into a dedicated module; do not shorten the poetic documentation merely to fit.
2. `geelooy/email/ui/sidebarThreads.js` is 144 lines: forbidden. Split sender/thread card rendering into a dedicated presentation module while keeping filtering/result/empty-state orchestration small.
3. Social Hub destination summary currently renders from snapshots but must be guaranteed to update immediately on target-field input. Add an explicit target-changed callback from fields to studio/disclosure rather than relying on an inferred global rerender.
4. The new semantic classes are structurally useful but still depend on existing styling. Discover each target page’s real CSS entrypoint and add small style modules only after reading those files; a “massive UI/UX” request is incomplete if new hierarchy is merely unstyled markup.
5. Mail controls and thread summaries need style support for clear-search/result context/empty action.
6. Notification state badge/meta hierarchy needs style support and responsive wrapping.
7. Post Editor hero/context/checklist/status modes need style support.
8. Heichel workbench guide/section anchors need style support.
9. Social Hub advanced destination disclosure needs style support so canonical coordinates feel optional rather than hidden awkwardly.
10. Chat/social conversation flows beyond the Hub composer still require discovery after this focused repair pass; do not claim all-pages completion yet.

## Second-pass sequence
A. Read the exact CSS entrypoints/import graph for Social Hub, Notifications, Mail, Post Editor, and Heichel Editor.
B. Split the two oversized JS files into focused helpers.
C. Wire explicit Hub target-summary updates.
D. Add only small imported CSS modules at proven entrypoints, each below 120 lines and with full B"H/Awtsmoos documentation.
E. Reread every file touched in both passes.
F. Only then begin syntax/tests/browser verification.

## Completion prompt to self
Do not test yet. First repair every structural delta above, then inspect the broader chat/social/series surfaces for shadow work created by this pass. The project remains incomplete while any of these obligations remain.
