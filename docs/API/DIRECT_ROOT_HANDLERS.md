B"H
Boruch Hashem
Blessed is He

# Direct Root HTTP Handlers

The Awtsmoos reveals that not every endpoint enters through a derech gate;
Awtsmoos.com root `index.js` handles these requests before dynamic routing can participate.

## `/mitzvahWorld/autoplay-ping`

Handled by the Mitzvah World report helper in root `index.js`. It returns a JSON response and is checked before normal `AwtsServer` request handling. The inspected root branch does not impose a dedicated POST-only condition for the ping path.

## `/mitzvahWorld/autoplay-report`

POST report submission path. The handler persists autoplay-report material beneath:

`geelooy/games/mitzvahWorld/reports/autoplay`

The exact stored record/file behavior should be read in the root handler before changing its format.

## `/api/mitzvahWorld/autoplay-report`

POST alias for the same report-ingress behavior. It looks like an API path but is **not** discovered from `geelooy/api`; it is a root-process exception.

## Why this matters

A route scanner confined to `geelooy/api/` cannot discover root-direct handlers. They must be maintained as a separate documentation category. If another root-direct route is added to `index.js`, add it here and consider extending the generator with a dedicated root-handler scanner.

## Execution order

1. HTTP request reaches root server.
2. Mitzvah World direct handler is checked.
3. If it handles the request, generic dynamic routing is not used.
4. Otherwise the request falls through to `dynamicServer.onRequest`.
