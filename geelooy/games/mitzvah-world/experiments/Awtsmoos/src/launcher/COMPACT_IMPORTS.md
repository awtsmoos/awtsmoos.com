# B"H

Boruch Hashem
Blessed is He

# Compact Local ESM Doors in MitzvahWorld

The Awtsmoos is beyond every request graph while Awtsmoos.com lets finite local modules gather before they cross the browser sea;
this guide keeps first play small, advanced depth deferred, and `compact=true` attached only where it removes a real waterfall without clouding what the player can see.

## Default rule

When the browser independently requests a **raw local MitzvahWorld ESM entry**, prefer `?compact=true`.

Examples:

- `./SomeOptionalEntry.js?compact=true`
- `./SomeVersionedEntry.js?compact=true&v=20260825-ui-01`

Use the canonical version ordering `?compact=true&v=...` so the compact request flag and cache identity are obvious to readers and tests.

## Why entry doors matter

`awtsmoos.com/ayzarim/awtsmoosDynamicServer/compactJs/` recursively gathers local static imports and discoverable literal relative dynamic imports. Query strings and hashes are removed only for filesystem resolution, so `compact=true` does not change which source file is found.

The goal is therefore **fewer browser request waterfalls**, not fewer source modules. Keep the source tree deeply modular.

## Preserve literal import visibility

Prefer literal relative dynamic imports when practical:

```js
await import('./Feature.js?compact=true');
```

Do not wrap every `import()` URL in a generic computed helper. The compact compiler performs source discovery and can only fold relationships it can understand from source text.

## Do not re-compact generated artifacts

MitzvahWorld already builds deterministic compact artifacts such as:

- `mitzvah-world.compact.js`
- `mitzvah-world-presentation.compact.js`
- `mitzvah-world-world.compact.js`
- `mitzvah-world-optional.compact.js`

These are compiler outputs. Do not hand-edit them and do not mechanically append `compact=true` merely because they are requested by the browser. Regenerate them through `build/build-js.cjs`.

## Do not compact public vendor ESM

The Dynamic Server treats these public prefixes as external module identities:

- `/games/scripts/build/`
- `/scripts/build/`

Leave those imports external. Decorating them with compact query flags can obscure vendor identity and defeat the intended singleton boundary.

## Preserve startup architecture

Compaction must never mean eager loading everything. MitzvahWorld deliberately keeps:

1. a tiny first-control runtime,
2. deferred presentation,
3. deferred rich world,
4. deferred optional systems.

Movie Studio, creative authoring, multiplayer networking, and advanced presentation must stay outside direct solo startup unless the route explicitly requests them.

## Current compact-aware raw doors

The launcher/runtime currently applies `compact=true` to independently requested raw local entries including single-player runtime, multiplayer runtime/status, direct/post-play experience, creative mode, gameplay presentation/audio, creative dock/HUD controller, and rich-world hydration.

When adding another optional raw local entry, ask: **Can the browser request this source file outside an already-compact generated module universe?** If yes, default toward `compact=true`. If the import is a generated compact artifact or public vendor ESM, do not add it mechanically.
