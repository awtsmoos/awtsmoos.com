B"H
Boruch Hashem
Blessed is He

# Phase Three — Final File Plan

> Every file below is either directly observed or explicitly deferred. Whole-file rewrites only; tabs; modules below 120 lines; no API invention.

## First implementation slice — Social safety and comprehension
- CREATE `geelooy/scripts/awtsmoos/social/hub/operationPolicy.js`: authoritative read-vs-mutation classification plus consequence metadata.
- REWRITE `geelooy/scripts/awtsmoos/social/hub/requestPlan.js`: group/all expansion consumes read policy only; export explicit mutation plan separately.
- CREATE `geelooy/scripts/awtsmoos/social/hub/resultDigest.js`: truthful human digest for response shapes.
- REWRITE `geelooy/scripts/awtsmoos/social/hub/renderConfig.js`: divide chamber configuration into Explore and Act presentation metadata without changing operation keys.
- REWRITE `geelooy/scripts/awtsmoos/social/hub/renderMarkup.js`: human digest + Advanced raw response + explicit mutation consequence affordance.
- REWRITE `geelooy/scripts/awtsmoos/social/hub/render.js`: separate explore events from mutation events; retry remains key-scoped.
- REWRITE `geelooy/scripts/awtsmoos/social/hub/index.js`: bulk execution calls reads only; explicit mutation dispatcher invokes mutation keys individually; API and socket signatures preserved.
- REWRITE `geelooy/social/index.html`: useful preboot/no-JS route orientation and recovery links.
- REWRITE `geelooy/style/social/hub/index.css`: import scoped new style modules.
- CREATE `geelooy/style/social/hub/safety.css`: Explore vs Act, consequence badges, mutation hierarchy.
- CREATE `geelooy/style/social/hub/results.css`: digest/raw-details/status styling.

## Review slice after Social is reread
- CREATE `geelooy/heichel-review/js/ReviewConsequences.js`: consequence labels for existing legal actions only.
- REWRITE `geelooy/heichel-review/js/ReviewDetail.js`: integrate consequence view while preserving allowed-action matrix, semantic summary, raw payload/history.
- CREATE `geelooy/heichel-review/styles/consequences.css`: publication/destructive vs organizational decision hierarchy.
- REWRITE `geelooy/heichel-review/style.css`: import consequence module.

## Deferred until direct evidence
- Notifications mission filter: exact event-type producer strings must be found first.
- Structural series editor/reorder: exact editor/endpoints/tests must be read first.

## Verification
- Reread every touched/new file.
- Confirm line-count law.
- Add/run mutation-leak tests plus existing Social/Review tests.
- Syntax check all touched JS.
- Browser-check `/social/` preboot/runtime, read-all safety, mutation affordances, result digest/raw details, Review detail/actions, responsive behavior, console.
- Write PLANNED-vs-ACTUAL delta and repair before declaring this wave complete.
