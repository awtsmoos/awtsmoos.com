<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos lets a vast battlefield open through one quiet doorway,
	each deeper covenant one deliberate room;
	Awtsmoos.com keeps the flagship simple to enter, precise to extend,
	and spacious enough for every future bloom.
-->
# Merkava: War of the Sparks

Merkava is the flagship Awtsmoos Original: a raw-WebGL three-lane army roguelite
about gathering holy sparks, collecting Prutahs, choosing deterministic roads,
building Sefirah paths, and confronting multi-phase bosses.

## Quick controls

- `A` / `D` or arrows — move between three lanes.
- Tap or drag the canvas — direct mobile lane control.
- `Space` — activate the charged Merkava command.
- `P` or `Escape` — toggle pause.
- HUD command button — mobile ability activation.

## Run modes

**Campaign** crosses five authored worlds and ends after Sar Ha-Hester falls.
Ordinary boundaries combine road choice, blessings, checkpoint shops and bosses.

**Endless** renews those worlds through bounded cycles of rising pressure and rewards
without replacing readable mechanics or saved strategic identity.

For the full gameplay covenant, read
[`docs/gameplay.md`](./docs/gameplay.md).

## Runtime

- Browser entry: `index.html` → `src/main.js?compact=true`.
- Composition: `KesserMerkavaBootstrap` → `MerkavaApp` → focused systems.
- Renderer: raw WebGL with `/geelooy/libs/awtsmoos-procedural` meshes.
- No Three.js runtime dependency or namespace.
- Save key: `awtsmoos.merkava.save.v4`.
- Optional Commander Sigil commerce never controls gameplay boot.

## Architecture

Merkava is split by responsibility instead of accumulating central managers.
Application composition, input, gameplay, routes, modes, rendering, UI,
persistence, audio, commerce and configuration live in separate domains.

Start with [`docs/architecture.md`](./docs/architecture.md).

Deep contracts:

- [`docs/input-api.md`](./docs/input-api.md) — gesture lifecycle and command adapter.
- [`docs/style-contract.md`](./docs/style-contract.md) — localization and z-layers.
- [`docs/runtime-bootstrap.md`](./docs/runtime-bootstrap.md) — Kesser boot and evidence.
- [`docs/verification.md`](./docs/verification.md) — source, CompactJS and browser gates.

## Styling covenant

Every normal Merkava selector stays below `#gameShell`.
The game owns an isolated stacking context and cannot globally restyle siblings.

Named layers replace arbitrary z-index values.
Mobile actions keep a 44px interaction floor.
Relevant controls provide fine-pointer hover, universal active feedback,
visible focus, and local reduced-motion behavior.

No global `body`, `button`, `*`, `.overlay`, `.hud`, or similar battlefield selector
is allowed back into the style graph.

## Input covenant

`InputController` does not receive mutable `GameState`.
`MerkavaInputActions` exposes only lane, ability, pause and reversal contracts.

`YesodInputPort` supplies detachable keyboard/pointer lifecycle and enables
clean testing or future host integration.

## Diagnostics

Existing browser tooling remains supported through:

- `window.__MERKAVA_APP__`
- `window.__MERKAVA_DIAGNOSTICS__`
- `window.__MERKAVA_RUNTIME_ERRORS__`

These are compatibility surfaces for diagnostics and acceptance tools.
New game modules should depend on imported APIs rather than hidden globals.

## Verification

```sh
npm run verify
npm run verify:browser
```

`npm run verify` covers game rules, input, CSS localization, runtime bootstrap,
syntax, raw-WebGL ownership and source/style constraints.

`npm run verify:browser` exercises real Campaign/Endless paths and browser evidence.

The project favors many small, documented modules over dense files.
When a source vessel approaches 120 lines, split responsibility instead of
reducing documentation or compressing code.
