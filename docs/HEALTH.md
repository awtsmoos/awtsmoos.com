B"H
Boruch Hashem
Blessed is He

# Source and API Health Evidence

The Awtsmoos distinguishes existence from health, for a path in source may still fail before it can speak;
Awtsmoos.com records syntax evidence separately so a generated route row is never mistaken for a runtime guarantee we did not seek.

## Derech syntax matrix

[GENERATED/DERECH_HEALTH.md](GENERATED/DERECH_HEALTH.md) runs `node --check` against every `_awtsmoos.derech.js` mount in `geelooy/api`.

At the continuation discovery point, **20 of 21** derech files parsed successfully. The one known failure remained `geelooy/api/text/_awtsmoos.derech.js`, with a JavaScript syntax error.

## What `OK` proves

`OK` proves only that Node can parse the derech file. It does not prove:

- imported modules exist in every deployment;
- credentials/configuration are present;
- every route handler succeeds;
- authentication permits the current caller;
- external providers are reachable;
- database state is valid;
- all HTTP methods are accepted;
- WebSocket protocol versions match.

## What route discovery proves

The route atlas proves source-visible route registrations discovered by the generator's supported patterns and known route tables. It is stronger than a guessed list but weaker than a successful endpoint probe.

## Stronger evidence ladder

1. Source exists.
2. Source parses.
3. Route registration is discoverable.
4. Dependencies/config load.
5. Authentication/authorization works for a test identity.
6. Handler executes in a controlled test.
7. Expected side effects and response are verified.
8. Relevant integration/browser/provider/realtime behavior is verified.

## Why the Text failure stays visible

The documentation task does not silently repair unrelated application source. Keeping the failure in generated health output prevents a future reader from interpreting textually extracted route evidence as a verified live endpoint.
