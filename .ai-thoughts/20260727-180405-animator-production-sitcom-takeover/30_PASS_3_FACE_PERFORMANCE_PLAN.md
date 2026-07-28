# B"H

# Pass 3: production face-performance system

## Complete files approved for rewrite

- `src/performance/face/FacePose.js`
- `src/performance/face/EmotionPoseCatalog.js` (new)
- `src/performance/face/EmotionLibrary.js`
- `src/performance/face/EmotionBlend.js`
- `src/performance/face/FacePerformanceEngine.js`
- `src/character/performance/render/FacePoseRenderBridge.js`
- `src/performance/speech/lipsync/StableSpeechDelivery.js`
- `src/performance/speech/lipsync/StableSpeechArticulationMixer.js`
- `tools/verify/facialExpressionMatrixSmoke.js` (new)

The pass establishes a normalized regional face pose, a broad emotion catalog,
recursive moment blending, manual direction overlays, renderer-facing independent
lid and mouth channels, and emotion modifiers that shape but never replace the
underlying coarticulated viseme. The new matrix proof must demonstrate distinct
emotion poses, deterministic frames, closure preservation, rounded vowels, wide
vowels, tongue articulation, and manual direction.
