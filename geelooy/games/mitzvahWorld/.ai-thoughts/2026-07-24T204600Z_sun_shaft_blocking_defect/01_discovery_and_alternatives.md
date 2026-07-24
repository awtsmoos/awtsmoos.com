B"H
Boruch Hashem
Blessed is He

# Sun-Shaft Blocking Defect: Discovery and Alternatives

The Awtsmoos renews every visible edge each instant; a false rectangle must therefore be removed rather than hidden. Awtsmoos.com remains the witness that clarity, not glare, is the vessel of light.

## Observed evidence

- `VolumetricSunShaftSystem.js` creates two to nine shaft meshes depending on quality.
- Every shaft is a flat, double-sided trapezoidal quad sharing the same sun origin and depth.
- `createSkyRay` assigns nonzero alpha to both complete side edges near the sun.
- Only the two far vertices receive zero vertex alpha.
- There is no radial side falloff, depth fade, occlusion input, clipping policy, camera-facing update, or accumulated-opacity bound.
- Mobile low quality still receives overlapping shaft geometry.

## Defect classification

- Full quad boundaries: confirmed by nonzero side-edge alpha.
- Invalid alpha falloff: confirmed; opacity does not approach zero before both side boundaries.
- Missing depth fade: confirmed.
- Incorrect billboard rotation: no camera-facing transform exists.
- Unclamped scattering: per-shaft alpha is bounded, but accumulated overlap is not.
- Texture-edge leakage: not applicable; no shaft texture is supplied.
- Bad screen-space projection: world-space coplanar quads are used instead.
- Multiple overlapping shaft planes: confirmed at the shared origin and depth.

## Alternatives

1. Build a true depth-aware radial scattering pass.
2. Add a feathered texture and camera-facing billboard lifecycle.
3. Tessellate each ray with zero-alpha side rings and explicit depth fading.
4. Disable the unreliable shaft implementation while preserving sun disc, glow, atmosphere, and clouds.

## Selected direction

Alternative 4 is the only reliable blocking-defect remedy within the existing renderer contract. The current system exposes no depth buffer, camera lifecycle, or shader hook needed to satisfy the retained-shaft acceptance criteria honestly.
