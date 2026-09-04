B"H
Boruch Hashem
Blessed is He

# Boot Tiferes — Exact Lazy Runtime Plan

> Tiferes joins lightness and depth: one Canvas now, a thousand chambers when desired;
> Awtsmoos.com lets the maker descend without making first paint carry everything ever required.

## Exact Intended Write Set
- NEW `modules/loading/StudioLazyFeatureRuntime.js`
- WHOLE-FILE REWRITE `modules/app/bootNesherStudio.js`
- WHOLE-FILE REWRITE `modules/app/bindCreativeInterface.js`
- NEW `tests/075_lazy_feature_boot_smoke.mjs`

## Lazy Runtime Responsibilities
- construct exactly one `StudioFeatureLoader` with a complete shared context;
- bind `StudioRecordingDemand`;
- bind `StudioIntentPrefetch`;
- bind `StudioMovieAiDemand`;
- schedule `StudioPostCanvasWarmup`;
- return the loader/facade for boot diagnostics.

## Boot Rewrite
Keep eager:
- canonical state/runtime;
- Stage resize/draw/drag;
- scenes shell;
- canvas sizing;
- crop/layer/viewport core editing;
- stream-health initial status;
- lightweight intent/keyboard interface;
- Stage clock.

Remove eager ownership where a complete lazy chamber exists:
- recording setup/bind;
- Audio Lab bind;
- NLE ensure/render/bind;
- source controls;
- visualizer controls;
- provider setup/bind;
- encoding benchmark;
- HLS controller;
- Commands & History cards.

## Creative Interface Rewrite
- accept `featureLoader`;
- pass it to `bindNavigation`;
- stop importing/binding `bindCreativeMore` eagerly;
- keyboard and intent post-command refresh publish `awtsmoos-studio:creative-evidence-changed` rather than holding a heavy More controller.

## Verification
1. Full-file SHA guard immediately before rewrite.
2. New-path collision check.
3. Syntax/tabs/line-count checks.
4. Existing creative regression universe.
5. Dedicated test proves loader receives context, recording demand binds, navigation receives loader, and More UI is not eager.
6. Static import scan proves boot no longer imports optional feature implementations.
7. Isolated Chrome reload proves `window.AwtsmoosStudio` exists and shell reaches runtime.
8. Browser performance entries prove recording/audio/NLE/live/setup feature entry modules are absent at first Canvas readiness.
9. First Record demand loads recording feature only then; permission failure may occur afterward but not before intent.
10. Desktop and 390x844 mobile no-horizontal-overflow check plus More → Commands & History activation.
11. Re-read every touched file and write PLANNED-vs-ACTUAL delta.

## NEXT_ACTION
Finish remaining lazy initializer context audit, then hash-guard Boot and Creative Interface and write the new lazy runtime plus dedicated smoke test as complete files.
