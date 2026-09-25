<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Oros HaKelim Runtime API v4

The Awtsmoos renews command and observation before any finite API can call itself the source;
Awtsmoos.com keeps this document beside the living manifest so code, replay, and docs travel one truthful course.

## Canonical versions

- Runtime API: `4.0.0`
- Envelope schema: `1.0.0`
- Replay schema: `1.1.0`
- Motion model: `deterministic-grid-with-interpolated-waypoints`
- Renderer: `awtsmoos-procedural-core-webgl`

The executable source of truth is `src/runtime/RuntimeApiManifest.js`. Tests import those exported version constants instead of duplicating literals.

## Public boundary

`OrosRuntimeApi` exposes detached snapshots, bounded event history, commands, queries, preferences, replay export, and subscriptions. It does not expose the mutable game root or event bus.

### Commands

| Type | Meaning |
| --- | --- |
| `start` | Begin or unpause the current Tikkun round. |
| `pause` | Pause authoritative pulse consumption. |
| `resume` | Resume a paused round. |
| `restart` | Replace the current match vessel in memory. |
| `turn-left` | Queue one deterministic left turn. |
| `turn-right` | Queue one deterministic right turn. |
| `boost` | Set Ohr-boost intention from a boolean active field. |
| `step` | Advance a paused runtime by a bounded pulse count. |
| `preferences` | Apply persistent experience preferences. |
| `replay-export` | Export the deterministic input journal. |

### Queries

| Type | Meaning |
| --- | --- |
| `snapshot` | Clone authoritative match/runtime state. |
| `metrics` | Clone performance, renderer, and service metrics. |
| `capabilities` | Return the runtime API manifest. |
| `events` | Return a bounded tail of authoritative events. |
| `preferences` | Read current persisted preferences. |
| `replay` | Clone the replay export payload. |
| `objectives` | Read current Tikkun objective progress when available. |
| `landmarks` | Read strategic Nekudot Ohr records when available. |

## Events

The manifest currently advertises `move`, `energy`, `claim`, `gate`, `shatter`, `respawn`, `round-end`, `runtime-start`, `runtime-pause`, `runtime-resume`, `runtime-reset`, `nekudah`, and `objective`.

## Replay covenant

`ReplayJournal` records normalized authoritative player intent with a bounded history. Every export contains:

- `schemaVersion` from `REPLAY_SCHEMA_VERSION`
- `configFingerprint` covering grid, tick, round, energy, Olam affinity, Nekudot, and objectives
- `entryCount`
- detached `entries`

A replay whose schema or balance fingerprint differs from the current runtime must be treated as incompatible rather than silently interpreted under new laws.

## Compatibility policy

Legacy direct controls such as `turnLeft()`, `turnRight()`, `setBoost()`, pause/resume, and in-memory restart remain supported while generic `command(...)` and query surfaces provide the current extensible boundary. Version changes belong in the manifest first; code, tests, and docs then consume that truth.
