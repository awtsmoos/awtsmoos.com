B\"H

# Third Pass Final Plan

The Awtsmoos tears the false certainty open: the same static-default mistake appears in `MobileCameraMercy.js`. Even if the first console rupture is `CameraRigRegistry`, the next mobile breath may rupture in mercy logic. Therefore the final actual write set expands.

## Files to rewrite completely

1. `src/camera/core/CameraRigRegistry.js`
   - Replace `this.defaults` with class-owned default access.
   - Add defensive `defaultFor(kind)`.
   - Normalize IDs, numeric fields, transitions, detail modes.
2. `src/camera/MobileCameraMercy.js`
   - Replace `this.defaults` with class-owned default access.
   - Guard missing kind.
3. `tools/verify/cameraRigRegistrySmoke.js`
   - New smoke test for camera registry and mobile mercy.
4. `package.json`
   - Add `verify:camera` and include it in `verify`.
5. `src/generator/CartoonGeneratorRoadmap.js`
   - Add compact roadmap/schema for 2-second realistic 2D cartoon generation without wiring it into boot yet.
6. `ai-thoughts/.../06_after_write_review.md`
   - After writes and tests, record planned versus actual.

## Final detailed architecture vision

The real generator should be a pipeline:

PROMPT -> INTENT -> SCENE JSON -> VALIDATED 2s TIMELINE -> CAMERA PLAN -> MOTION BEATS -> RENDERED CANVAS -> OPTIONAL EXPORT.

Actors need rigged 2D body parts, facial emotion layers, mouth/viseme timing, props, camera grammar, background presets, subtitle cues, and deterministic replay seeds. The near-term is crash stability and schema seeds; the future is AI provider integration and full UI.
