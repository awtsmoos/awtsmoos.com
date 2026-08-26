<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos lets first awakening become visible without mixing error, ornament, and command;
	Awtsmoos.com reveals Kesser as a clean crown where each runtime covenant can separately stand.
-->
# Merkava Runtime Bootstrap

## Runtime path

The production browser path is:

`index.html` → `src/main.js` → `KesserMerkavaBootstrap` → `MerkavaApp`.

`src/main.js` intentionally performs one act:
construct Kesser and call `awaken()`.

## `KesserMerkavaBootstrap`

Kesser coordinates startup but does not own gameplay rules.

It receives injectable dependencies for:

- browser publication target;
- document target;
- application factory;
- diagnostics factory;
- runtime journal;
- optional commerce gateway.

`awaken()` connects runtime evidence first, creates the application,
publishes compatibility globals, then starts optional commerce without awaiting it.

A construction failure is recorded and revealed through the bounded
`#fatalError` UI instead of leaving a half-published game.

## Runtime evidence

`OhrRuntimeJournal` owns browser runtime-error listeners.

It preserves the legacy live array at `window.__MERKAVA_RUNTIME_ERRORS__`,
records normal runtime errors, unhandled promise rejections and fatal boot errors,
and can detach every listener through `disconnect()`.

`snapshot()` returns detached frozen records for safe diagnostics consumption.

## Compatibility globals

Successful boot preserves these existing browser-driver contracts:

- `window.__MERKAVA_APP__`
- `window.__MERKAVA_DIAGNOSTICS__`
- `window.__MERKAVA_RUNTIME_ERRORS__`

`__MERKAVA_DIAGNOSTICS__` remains frozen.
It identifies the engine as `raw-webgl` with procedural meshes enabled.

These globals are diagnostic compatibility surfaces.
New game code should use imported module APIs instead of reaching through them.

## Optional commerce

`OptionalCommerceGateway` owns only the dynamic import boundary.

The existing `bootCommanderSigil()` remains authoritative for the feature itself.
The gateway loads that module after the game exists and converts load failure
into a warning plus a `false` result.

A Wallet outage, account state, missing feature module, or Commander Sigil error
must never reject core gameplay boot.

## Fatal behavior

When application construction fails:

1. the journal records a `boot` entry;
2. the configured console receives the original error;
3. `#fatalError` is displayed when available;
4. no `__MERKAVA_APP__` global is published;
5. optional commerce does not become gameplay authority.

## Testing

`test/bootstrap.test.mjs` protects journal identity and listener cleanup,
successful global publication, frozen diagnostics, bounded fatal presentation,
and non-fatal optional-commerce failure.
