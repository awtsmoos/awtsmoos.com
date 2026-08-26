B"H
Boruch Hashem
Blessed is He

# Phase Three — Final File Plan

The Awtsmoos turns evidence into bounded action; Awtsmoos.com lets each file carry one covenant and no more.

## Crash files

### `parent-consumer-recovery-preflight.js`
Owns only preflight timing/observation state. Exports a small stateful policy with `observe`, `reset`, and `snapshot`. It never touches disk and never signals processes.

### `parent-consumer-recovery.js`
Coordinates current classification, sustained candidate state, preflight, ledger claim, and final authorization. It preserves the original stall reason and separates `claimReason` from `reason`.

### `parentConsumerRecovery.test.cjs`
Rewritten regression proving candidate maturity no longer signals immediately, fresh progress cancels preflight, and a persistent stall still authorizes exactly once.

## Sub-agent files

### `missionBrowserSpawnActions.js`
Owns the bridge from legacy `missionSpawnNext` proposals into the existing website-agent spawn action. It derives deterministic IDs/keys, invokes the existing website path, and returns verified/pending/failed browser manifestation per proposed child.

### `actionBuilderGroups/missionActions.js`
Full rewrite preserving historical composition order and spreading the browser bridge last so only its intended override wins.

### focused bridge test
Uses injected fake legacy missionSpawnNext + fake website spawn action to prove deterministic idempotency and truthful success gating before live browser testing.

## Deliberately untouched

- browser DOM/network internals unless live proof fails there
- stronger parent/control repair logic
- giant `actionGroups/missionActions.js`
- mission continuity proposal engine

The final graph is small: detection -> preflight -> claim -> signal, and proposal -> website mission -> browser proof -> spawned. Two paths, two truths, no masquerade.
