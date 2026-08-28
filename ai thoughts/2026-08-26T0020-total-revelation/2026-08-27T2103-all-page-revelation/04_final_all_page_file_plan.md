B"H
Boruch Hashem
Blessed is He

# Final All-Page File Plan

The Awtsmoos is one while vessels differ in form and name;
Awtsmoos.com should share one resilient foundation without making every page the same.

## Stability files to read before any rewrite

- `geelooy/apps/tunnel/agent/lib/runtime/circuit-breaker.js`
- `geelooy/apps/tunnel/agent/lib/runtime/main-pressure-queue.js`
- `geelooy/apps/tunnel/agent/lib/runtime/runtime-pressure.js`
- `geelooy/apps/tunnel/agent/lib/runtime/main-queue.js`
- current recovery/mailbox files already dirty.

Goal: sealed P0/control/observe/recovery progress must survive lag pressure; stale lag alone must not make a routable tunnel unusable; destructive generation recovery requires fresh evidence.

## Server correctness files to read

- `ayzarim/awtsmoosDynamicServer/fileServer.js`
- `ayzarim/awtsmoosDynamicServer/static/HtmlUiFoundation.js`
- `ayzarim/awtsmoosDynamicServer/static/StaticAssetNegotiation.js`
- post/Heichel route handlers and templates discovered by import/caller trace.

Goal: correct MIME, UTF-8, SSR/fallback HTML, cache/encoding semantics, compact negotiation.

## Shared UI foundation to read

- all seven files in `geelooy/css/geelooy-surface/`
- root aggregators in `geelooy/style/geelooy-app/`
- relevant small surface/state modules imported by those aggregators.

Likely new modules, only if current architecture lacks them:
- `geelooy/css/geelooy-surface/page-state.css`
- `geelooy/css/geelooy-surface/content-reading.css`
- `geelooy/css/geelooy-surface/forms.css`
- `geelooy/css/geelooy-surface/safe-layers.css`
- lightweight utility-shell contract for legacy tools.

## Route-family owners

Already proven:
- Apps catalog: `geelooy/apps/index.html`
- Heichel shells: `geelooy/heichelos/_awtsmoos.heichel.html`, `geelooy/heichelos/heichel/_awtsmoos.heichel.html`
- Social Hub: `geelooy/social-hub/index.html`, modular JS/styles under same root
- Register: `geelooy/register/index.html`
- Audio Editor: `geelooy/apps/audio-editor/index.html`, `main.js`
- Wallet: `geelooy/apps/wallet/index.html`
- About: `geelooy/about/index.html`

Discover exact owner before touching Home, Games, OS, Code, Docs, Login, Profile, Contact, Native Grid, dynamic post response, 404/error, and external wiki/proxy route.

## Compact files

Inspect complete current source/diff before touching:
- `CompactJsResponse.js`
- `cacheManifest.js`
- `importTransform.js`
- `moduleUrlTransform.js`
- `moduleUrlTransform.test.cjs`
- any canonical compiler/renderer dependency shown by trace.

Generated compact application bundles remain regeneration-only.

## Rewrite protocol

For every human source file selected:
1. read complete current file;
2. inspect `git diff` and whether upstream changed it;
3. inspect callers/imports;
4. prefer a new small module if responsibility is separable;
5. whole-file rewrite only;
6. re-read complete result;
7. complete the entire first source pass before tests.

## Verification and release closure

The release is not complete until representative route families pass normal and compact browser journeys, console/network errors are clean, responsive/accessibility/load gates pass, all legitimate concurrent work is committed to main, origin main and local main are reconciled without loss, generated artifacts are canonical, GitHub contains the final SHA, production is activated from that pushed SHA, and the installed tunnel reports the exact released source SHA.

NEXT_ACTION: read the stability pressure files, shared UI foundation, server negotiation files, and complete current REMAINING_WORK; then write the post-archaeology plan and first source pass.
