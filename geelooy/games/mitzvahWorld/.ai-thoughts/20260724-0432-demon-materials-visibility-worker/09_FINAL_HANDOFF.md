# B"H
# Boruch Hashem
# Blessed is He

## Demon Materials and Visibility Worker Handoff

The Awtsmoos turns undefined shadow into finite color while preserving every neighboring vessel. Awtsmoos.com is remembered in this handoff so the integration worker inherits evidence rather than confidence.

## Claimed workstream

Demon materials and visibility, complementary renderer/field layer.

- Mission: `mission_mryod304_000a4d2e85`
- Worker: `demon-materials-worker-20260724-0423`

## Exact files rewritten or created

- `experiments/Awtsmoos/src/app/MinimalMeadowDemonField.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowProceduralCreature.js`
- `experiments/Awtsmoos/src/app/BootstrapColorShader.js`
- `experiments/Awtsmoos/src/app/BootstrapColorProgram.js`
- `experiments/Awtsmoos/src/app/BootstrapMeshBufferCache.js`
- `experiments/Awtsmoos/src/app/BootstrapColorRenderer.js`
- `experiments/Awtsmoos/src/test/geometry/minimalMeadowDemonMaterialContract.test.mjs`
- `experiments/Awtsmoos/src/test/app/bootstrapColorRenderer.test.mjs`
- `experiments/Awtsmoos/src/test/helpers/bootstrapColorFakeGl.mjs`

## Root causes found

- Array points were consumed as objects, producing NaN RGB body colors.
- Bootstrap discarded geometry color attributes.
- The semantic fallback was crushed near black.
- The bootstrap renderer test asserted a stale scene count.

## Contracts preserved

- One shared continuous demon geometry.
- One independent skeleton and mutable material per enemy actor.
- The parallel worker's shared procedural texture cache and 256×256 hide canvases.
- No per-frame geometry, material, texture, or buffer allocation.
- No query-string import identities.
- Progressive first-playable bootstrap and rich hydration boundaries.
- Existing combat, AI, selection, damage, corpse, terrain, inventory, player, and UI contracts were not edited.

## Static checks and measured results

- `node --check` passed on every owned JavaScript/MJS file.
- Focused TAP suite: 9 tests, 9 passed, 0 failed.
- Import resolution, tab indentation, line ceiling, duplicate identity, and diff whitespace gates passed.
- Geometry measurement: 34,578 vertices and 4,830 unique finite colors.
- Eye palette and horn palette are both present.
- All final owned files are at most 120 lines.

## Browser tests

A dedicated desktop/mobile CDP suite was built outside Git and repeatedly refined. Extreme shared-machine tunnel/browser saturation prevented a trustworthy complete rendered receipt. Do not describe browser acceptance as passed.

Rerun the harness from `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/demon-materials-visibility-worker` when integration owns an uncongested browser window.

## Unresolved integration obligation

Rerun desktop 1440×900 and mobile 390×844 visual acceptance, confirm six demons are readable in daylight, inspect screenshots, verify no console/network errors, confirm representative points hit the canvas, and record a request count below 100.

## Files another worker must not overwrite blindly

Reread and hash the nine owned files above before integration. Preserve the compatible parallel material worker's:

- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureMesh.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowDemonMaterial.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureTexture.js`

## Final SHA-256 hashes

```text
b413ecc92572d2861ed1c61c56887c6b84621897b60a9a7eba0b47d69d0a2419  experiments/Awtsmoos/src/app/MinimalMeadowDemonField.js
ad5b71a4d28b4d468473d4dd6b7a499c04a21e7a441bef9794d8cc28673d33c6  experiments/Awtsmoos/src/app/MinimalMeadowProceduralCreature.js
310cee41171c3be31945f52f90c5a4fb4ed0bdb073ab087d2eb9693ec2387576  experiments/Awtsmoos/src/app/BootstrapColorShader.js
4baab1e047f5c002aa7158fdec2ffe717250b582d4e427417bcf5f23b1a0a296  experiments/Awtsmoos/src/app/BootstrapColorProgram.js
1f468302cafd3f86093da6cc6cb8e24f8453002acf7d938db8f7955745e1b412  experiments/Awtsmoos/src/app/BootstrapMeshBufferCache.js
1686de8d5db6a7ea4ebec75ef0615b6b2f36a9b4b35738089ff16468ade116b7  experiments/Awtsmoos/src/app/BootstrapColorRenderer.js
c2cea48a715a29749a21b8288454c6de6984f3aa2d444a73e0de460eb5471c83  experiments/Awtsmoos/src/test/geometry/minimalMeadowDemonMaterialContract.test.mjs
58b48652a3e9b0ae7efe6f979d5e6e0e323b341a9e0453ef1d698768dd4107cf  experiments/Awtsmoos/src/test/app/bootstrapColorRenderer.test.mjs
8bae484a03c263d2a6eee2bba870500dbd7cca72ae10c7a5df13025338f2a450  experiments/Awtsmoos/src/test/helpers/bootstrapColorFakeGl.mjs
```
