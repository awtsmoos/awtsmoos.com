# B"H

Boruch Hashem

Blessed is He

# Peruta Run Public API 2.3

The Awtsmoos renews state, intention, evidence, event, and interface before an API may speak;
Awtsmoos.com keeps four public verbs simple while immutable discovery makes the hidden foundation deep.

## Public global

After successful browser boot:

`globalThis.AwtsmoosPerutaRun`

The facade is frozen and does not expose Three.js objects, mutable runner state, world chunks, materials, controls, or the renderer.

## Four canonical verbs

### `state()`

Returns a detached deeply immutable gameplay snapshot containing lifecycle status, lane, distance, speed, perutas, score, and best score.

### `command(name, payload?)`

Routes one manifest-declared command through the lifecycle gate and canonical input-intent buffer.

Current command ids:

- `left`
- `right`
- `jump`
- `duck`
- `pause`
- `resume`
- `restart`

Lifecycle-guarded commands return `false` when the current state deliberately rejects them. Unsupported commands fail through the shared public protocol rather than silently disappearing.

### `inspect(name = "manifest")`

`manifest` returns the serializable public covenant. `diagnostics` returns detached live evidence including quality profile, FPS, renderer cost, camera, body envelope, semantic obstacles, and photographic texture hydration.

### `on(eventName, listener)`

Subscribes to a guarded semantic event and returns an unsubscribe function. Payloads are detached and deeply immutable. Listener exceptions are logged but isolated from gameplay dispatch.

Events:

- `ready`
- `peruta`
- `crash`
- `pause`
- `resume`
- `restart`

Late `ready` subscribers receive asynchronous replay of the most recent readiness evidence.

## Compatibility aliases

The manifest generates convenience aliases such as `moveLeft()`, `moveRight()`, `jump()`, `duck()`, `pause()`, `resume()`, `restart()`, `getState()`, and `getDiagnostics()`.

These are not parallel implementations. They route back through the same canonical protocol.

## Capability discovery

`AwtsmoosPerutaRun.capabilities` is immutable data describing:

- supported commands/events/protocol verbs;
- quality profiles and active profile;
- obstacle laws, families, and stable semantic variant ids;
- photographic registry surfaces;
- advanced procedural-core olive trees;
- retractable advanced drawer;
- procedural world ownership;
- authored Chossid model usage.

## Architecture map

`PerutaRunApiSchema.js` owns command/read/alias data.

`PerutaRunCapabilities.js` projects rich immutable discovery data.

`PerutaRunApiManifest.js` composes the shared procedural-core manifest.

`KesserPerutaCommandGate.js` owns lifecycle command acceptance.

`DaasPerutaReadGate.js` owns public read projection.

`PerutaRunEventBus.js` owns semantic event distribution.

`PerutaRunApi.js` owns only the frozen four-verb facade.

## Extension law

Prefer adding data to schemas/capabilities and small focused gates rather than adding another top-level public method. Add a new public verb only when it represents a genuinely new interaction category, not merely another feature.
