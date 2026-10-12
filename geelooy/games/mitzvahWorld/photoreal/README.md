# B"H — Reality Engine Photorealism Scene

Standalone hyperrealistic nature renderer on branch `reality-photorealism`.
No blocky placeholders: ez-tree-derived procedural trees, real photographic
textures, animated water, grass blades, particle motes.

## Run

Open `reality.html` in a browser (or capture headless):
`?view=forest|river|grassland|particles|character-forest|character-river|character-sitting|character-portrait|character-older|night`

Character views place Yaakov's procedural avatar in-scene (fedora, clear-frame
glasses, full beard always): standing in a forest clearing, walking the
riverbank, sitting on a rock, close-up portrait, older variant in a dark tee.
`night` renders a moonlit forest with fireflies + embers + character silhouette.

Capture (this VM):
`node ~/workspace/reality-photorealism/capture.mjs <view> <out.png>`
Fast capture (smaller viewport, fewer settle frames, `&fast=1`):
`node ~/workspace/reality-photorealism/capture-fast.mjs <view> <out.png> [WxH]`

## Textures (NOT in git — repo is code-only)

Real photographic textures live outside the repo:
`~/workspace/reality-photorealism/textures/` (+ `TEXTURE_MANIFEST.json`)
Recovered from the Awtsmoos Drive "textures" folder (wood/grass/dirt/wheat/leaves).

Copy them into `./textures/` before rendering:
`cp ~/workspace/reality-photorealism/textures/*.{jpg,png,webp} ./textures/`

Files: `grass1.jpg` (meadow), `dirt1.jpg` (earth), `bark1.webp` (bark),
`leaves1.png` / `leaf1.jpg` / `leaf2.jpg` (canopy), `wheat1.jpg`, `wood-hood1.jpg`.

## Provenance notes

- Tree generator: `libs/awtsmoos-procedural-core/.../tree/treeGenerator.js`
  (ez-tree presets absorbed as data in `ezTreePresets.js`; never vendored code).
- The old remote texture catalog (`awtsmoos.com/sites/firebase_drive_migration/`)
  is 404-dead; the `RemoteMaterialImageValidity` covenant rejects local images,
  which is why the game falls back to flat colors. This scene bypasses the
  covenant deliberately and uses the real photos directly.
