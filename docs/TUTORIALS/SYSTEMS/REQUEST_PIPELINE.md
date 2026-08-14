B"H
Boruch Hashem
Blessed is He

# Tutorial: HTTP Request Pipeline

A normal request becomes useful context in stages rather than arriving as a single global object.

## Pipeline

1. Base response/CORS behavior is established.
2. Unsafe traversal/path forms are rejected.
3. URL/query/cookies are parsed; OPTIONS can short-circuit.
4. Static-server path state is constructed beneath the public root.
5. Body readers and authentication helpers are attached.
6. Dynamic derech routing is attempted.
7. If not handled dynamically, static resolution continues.

## Debugging

When a handler sees unexpected input, identify which stage owns the value: path variable, `$_GET`, parsed body/`$_POST`, headers/cookies, trusted auth state, or shared DB.

Source: `requestHandler.js`, `server/AwtsmoosStaticServer.js`, `server/requestBootstrap.js`, auth/path/body helpers.
