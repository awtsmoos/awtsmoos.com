B"H
Boruch Hashem
Blessed is He

# Dynamic Paths and Dollar Variables

The Awtsmoos separates the path from the vessel so symbols do not deceive the eye;
Awtsmoos.com uses colons for the road, while dollar names carry request data nearby.

## The actual URL parameter grammar

`ayzarim/awtsmoosDynamicServer/routing/dynamicRouteMatcher.js` defines the route grammar observed in this checkout.

### Single segment

A route part beginning with `:` captures one URL segment.

Examples from the API surface:

- `/api/sefarim/:sefer`
- `/api/tunnel/control/blob/:blobId`
- `/api/ssh/connect/:username/:host`
- Social routes containing `:alias`, `:heichelId`, `:postId`, `:seriesId`, or `:commentId`

The captured values are published as route variables.

### Catch-all

A terminal part of the form `:name*` captures the remaining path. The matcher requires a catch-all to be last.

## The dollar-sign question

A filesystem search found no route files whose names require a `$` path convention. In the inspected derech code, dollar-prefixed names serve a different purpose:

- `$i` — request/server context vessel.
- `$_GET` — parsed query/input data.
- `$_POST` — parsed submitted-body data.
- `$_DELETE` — parsed delete-oriented input where used.
- `$u` — commonly a user/identity object in some modules.

Therefore **do not translate a route like `:alias` into `$alias`**. They are different layers.

## Leading and trailing slashes

`routing/routeForms.js` normalizes route aliases with common leading/trailing slash forms. This is why route tables may store keys such as `balance` while the mounted public route is documented as `/api/wallet/balance`.

## Derech mounting

The derech file is not itself a visible URL filename. Its directory determines the mount context. For example:

- `geelooy/api/gpt/_awtsmoos.derech.js` → `/api/gpt/...`
- `geelooy/api/tunnel/control/_awtsmoos.derech.js` → `/api/tunnel/control/...`

## Generated parameter list

See [../GENERATED/DYNAMIC_PARAMETER_INVENTORY.md](../GENERATED/DYNAMIC_PARAMETER_INVENTORY.md) for every parameterized route row discovered by the current generator.

## Caveat

A textually discoverable route is not necessarily healthy. `geelooy/api/text/_awtsmoos.derech.js` currently has a syntax error, so its patterns must be treated as source evidence, not verified runtime availability.
