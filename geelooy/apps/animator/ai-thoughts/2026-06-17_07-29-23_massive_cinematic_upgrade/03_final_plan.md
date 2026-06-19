B"H

# Final Plan

1. Add an AutomaticShotDirector that produces a cinematic plan every frame.
2. Add FrameQualityOracle scoring to make visual failure visible.
3. Add CinematicStagingDirector and TableAnchorDirector as safe adapters.
4. Route RenderPipeline through this plan without deleting old render systems.
5. Make CameraPhase/ActorGroundAligner honor cinematic modes more aggressively.
6. Make StageLayerComposer add cinematic room/detail overlays on screen so visual richness improves even if old scene files remain unchanged.
7. Verify by smoke tests and fast syntax.

No existing system is deleted. The new layer wraps old systems.
