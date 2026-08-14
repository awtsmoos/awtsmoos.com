B"H
Boruch Hashem
Blessed is He

# HTTP Routing 101

## What you will learn

How URLs meet `_awtsmoos.derech.js`, how path variables work, and why generated route evidence can differ from runtime availability.

## Derech discovery

The dynamic server walks ancestor directories looking for `_awtsmoos.derech.js`. A derech can therefore own nested source paths without each folder having its own mount file.

## Matching grammar

- exact segment: `/api/gpt/health`
- variable: `:name`
- terminal catch-all: `:path*`

Dollar-prefixed names such as `$i`, `$_GET`, and `$_POST` are request/context vessels, not URL syntax.

## Request flow

1. Normalize the path.
2. Locate the owning derech by ancestor discovery.
3. Match route forms.
4. Bind dynamic segment values.
5. Invoke the owning route/handler logic.
6. If no dynamic route handles the request, continue toward static behavior.

## Evidence versus runtime

`docs/GENERATED/API_ROUTE_ATLAS.md` is source-derived. `docs/GENERATED/DERECH_HEALTH.md` tells whether each derech currently parses. Text routes remain visible even though the Text derech currently fails syntax checking.

## Try a trace

Use [Trace a Request](TRACE_A_REQUEST.md) with one route from [API Tutorial Index](../GENERATED/API_TUTORIAL_INDEX.md).
