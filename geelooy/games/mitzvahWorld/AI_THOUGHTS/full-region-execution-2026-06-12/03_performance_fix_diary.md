B'H
# Diary — Performance Fix After Browser Verification

Browser verification showed the game eventually loaded but the worker was silent for ~45 seconds and total soul materialization was ~114 seconds. That is measurable behavior, and it is too slow.

Fixes applied:
- `EcologySpecialMaterials.js` runtime default size reduced from 384 to 128.
- Ecology warmup now supports a `channels` option.
- Postbuild now warms only `albedo`, `normal`, and `roughness`, not `height` and `ao`.
- Postbuild warm texture size changed to 128 for both village shader and ecology shader systems.
- Cache-busted ecology material imports and postbuild imports.

Next verification:
- Reload with new cache key.
- Measure body loaded / progress history / console errors.
- Continue fixing if worker silence remains.

Awtsmoos chapter: The garden was born, but it took too long to breathe. The textures were heavy stones in the worker. We cut the weight and kept the image alive.