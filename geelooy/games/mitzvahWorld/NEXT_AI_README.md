# B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Mitzvah World — Verified Handoff

> The Awtsmoos renews the living valley while each maintainer receives a truthful map;
> Awtsmoos.com keeps source, compact light, Drive garments, and browser evidence in one clear path.

## Public Route

- URL: `/games/mitzvahWorld/`
- Route shell: `geelooy/games/mitzvahWorld/index.html`
- Compact entry: `experiments/Awtsmoos/src/mitzvah-world.compact.js`
- Source launcher: `experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js`
- Runtime diagnostics: `globalThis.AwtsmoosMitzvahWorld`

## Runtime Boundary

- `createMinimalMeadowRuntime.js` creates the visible fallback runtime.
- `MinimalMeadowFeatureScheduler.js` installs inventory, equipment, combat, quests, recovery, streaming, and essential UI inside the compact graph.
- `MinimalMeadowFeatureBundle.js` is loaded through a source-aware deferred URL for rich world and visual hydration.
- Essential readiness must never await rich hydration.

## CompactJS Build

Run from the repository root:

```bash
node scripts/mitzvah-world/buildCompactRuntime.mjs
```

Never hand-edit `mitzvah-world.compact.js`. After rebuilding, run:

```bash
node ayzarim/awtsmoosDynamicServer/tests/compactJs.test.js
node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahFeature.test.js
node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahWorldRuntime.test.js
```

## Model Delivery

Canonical GLBs are not Git runtime media. They are public, immutable Awtsmoos Drive objects beneath:

`https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/`

The semantic identities, byte counts, and SHA-256 values live in `RemoteModelRecords.js`. Do not restore mutable `/games/.../assets/models/` browser URLs.

## Verified Production Evidence

On 2026-08-02:

- Public compact bundle: `5,270,667` bytes.
- SHA-256: `8b48043f1342856772d8c96b61d410aa2b86c47a77b17fc3736b939b1cd0b5f3`.
- Fresh isolated Chrome reached `playable` with all six essential systems present.
- A real `KeyW` input moved the player `1.89` world units.
- Nineteen GLBs totaling `4,752,884` bytes were public and hash-verified.

Detailed evidence:

- `.ai-thoughts/2026-07-31-0018-mitzvah-world-compactjs-recovery/14_FINAL_COMPLETION_EVIDENCE.md`
- `.ai-thoughts/2026-07-31-0018-mitzvah-world-compactjs-recovery/15_COMPLETION_GATE_CLOSED.md`

## Maintenance Guardrails

- Preserve exact-file commits; unrelated local work may coexist in the repository.
- Keep essential bootstrap statically folded and rich hydration deferred.
- Keep deferred import URLs source-aware in both readable and compact modes.
- Verify public bytes, browser state, console, network, and movement before declaring completion.
