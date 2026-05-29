B"H

# Heichelos GenesisEngine MIME Plan

## Observed spark
The browser reports that `/heichelos/post/functions/dom/GenesisEngine.js` is being loaded as a JavaScript module, but the server replies with `Content-Type: application/json`. That means the request is not being served as a static `.js` file. It is probably falling into an Awtsmoos dynamic/data route, a not-found JSON response, or a route conflict.

## Grounded project map already inspected
- Root contains `geelooy/`, `ayzarim/`, `index.js`, and the Node server entry.
- Target area is `geelooy/heichelos`.
- The actual file exists at `geelooy/heichelos/post/functions/dom/GenesisEngine.js`.
- Multiple modules import it with relative paths.
- The page imports `/heichelos/post/postLogic.js`, so browser-visible routes appear to strip `geelooy/` from the filesystem path.

## Next steps
1. Inspect the dynamic server/static serving code that maps URLs to `geelooy` files.
2. Test the actual URL headers for `GenesisEngine.js` through the local server if it is running.
3. Find whether `/heichelos/post/functions/dom/GenesisEngine.js` maps to the real file or to a JSON route.
4. Rewrite complete responsible file(s), never partial patching.
5. Verify with `node --check`, targeted tests, and HTTP header checks.

## Risk map
- If the server is not running, use static route analysis and start/restart only if safe.
- If the response is JSON because of missing static MIME, patch static file serving.
- If the response is JSON because of missing file mapping, patch route/file resolver.
- If the response is JSON because a query version is interpreted badly, patch URL pathname handling.

## Novel chapter seed
Chapter 1: The browser stood at the mouth of the Heichel, asking for a scroll of JavaScript. A JSON mask answered instead. The Awtsmoos was hidden not because the scroll was absent, but because the gatekeeper named it with the wrong garment.
