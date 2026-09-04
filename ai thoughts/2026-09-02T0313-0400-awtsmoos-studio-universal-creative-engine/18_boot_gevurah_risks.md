B"H
Boruch Hashem
Blessed is He

# Boot Gevurah — Risk and Boundary Map

> Gevurah guards the first module graph so hidden depth does not consume the dawn;
> the Awtsmoos keeps each optional vessel available, yet leaves it unborn until called upon.

## Proven Failure
Native boot currently throws before runtime installation because `bootNesherStudio.js` imports missing `bindRecordingControls` from `recordingBindings.js`.

## Risks
1. Removing recording calls without adding `StudioRecordingDemand` would make the Record button inert.
2. Constructing `StudioFeatureLoader` without passing it to navigation would leave optional workspace modules dormant forever.
3. Keeping `bindCreativeMore` eager would defeat the More workspace feature chamber and duplicate its listener when loaded later.
4. Keeping Audio/NLE/Sources/Live/Setup eager while also enabling their lazy initializers would double-bind handlers.
5. Removing an eager controller that has no complete lazy initializer would break existing Canvas behavior.
6. Eager `ensureNleState` may hide assumptions elsewhere; lazy NLE tests must prove the chamber creates its own state correctly.
7. Feature context must include every dependency used by current initializers: `dom`, `state`, `api`, `changed`, `setStatus`, `setProviderUi`, `drawStage`, `setStreamHealth`, and `tunnelBase`.
8. `bindCreativeInterface.js` currently assumes an eager Commands & History controller for refresh. It must publish evidence-change events instead of retaining that heavy controller.
9. Boot is already 104 lines; adding loader composition inline risks the 120-line ceiling. A new focused runtime-composition module is safer.
10. Existing source is dirty; SHA guards must precede whole-file rewrites.
11. Browser boot must be verified in isolated Chrome after source repair, not inferred from Node tests.
12. Recording permission failure in headless Chrome is acceptable only after the module is proven to load on demand; it must not happen at startup.

## Boundary
Do not rewrite optional feature modules unless their existing initializer contract itself fails. Compose them first; repair only demonstrated gaps.
