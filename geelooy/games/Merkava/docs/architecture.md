<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos lets many finite systems stand without confusing one vessel for another;
	Awtsmoos.com reveals Merkava as explicit covenants, each small enough to read and grow.
-->
# Merkava Architecture

## Composition law

Merkava is assembled from small domain modules.
The application layer coordinates them but does not own their rules.

The runtime path is:

`index.html` → `src/main.js` → `KesserMerkavaBootstrap` → `MerkavaApp` → domain systems.

`src/main.js` is intentionally tiny.
Runtime publication, error evidence, input translation, rendering, persistence,
commerce and gameplay each live behind separate APIs.

## Domain map

- `src/app/` — composition, lifecycle, bootstrap, diagnostics and strategic choices.
- `src/input/` — keyboard/pointer lifecycle and explicit gameplay commands.
- `src/game/` — state, progression, encounters, enemies, bosses and collisions.
- `src/routes/` — deterministic route generation, catalogs, modifiers and effects.
- `src/modes/` — mode definitions and bounded Endless scaling.
- `src/render/` — raw-WebGL resources, procedural meshes and rendering passes.
- `src/ui/` — HUD, labels, overlays and presentation events.
- `src/persistence/` — migration, validation, checkpoints, records and history.
- `src/audio/` — optional Web Audio with graceful failure.
- `src/commerce/` — optional Commander Sigil account cosmetic.
- `src/config/` — campaign, economy, color and quality constants.

## Dependency direction

Input never receives mutable `GameState` directly.
`MerkavaInputActions` translates state and commands into a narrow contract.

UI never needs to discover anonymous callbacks.
`MerkavaInterfaceActions` exposes named application intentions to `GameHud`.

Optional commerce loads after the application exists.
`OptionalCommerceGateway` cannot prevent gameplay boot.

Runtime errors are collected by `OhrRuntimeJournal`.
Kesser publishes legacy browser diagnostics without pushing diagnostics into game systems.

## Extension rule

Add new behavior to the narrowest domain that owns it.
If a file approaches 120 lines, split responsibility instead of compressing
comments, JSDoc or logic.

Prefer new adapters, coordinators and catalogs over adding conditionals to central classes.
Preserve save and browser contracts through explicit boundary modules.

## Stable browser contracts

Existing browser diagnostics and acceptance tools continue to receive:

- `window.__MERKAVA_APP__`
- `window.__MERKAVA_DIAGNOSTICS__`
- `window.__MERKAVA_RUNTIME_ERRORS__`

These globals are compatibility surfaces, not internal architecture.
New gameplay code should consume normal module APIs instead.
