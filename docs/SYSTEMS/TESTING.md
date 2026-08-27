B"H
Boruch Hashem
Blessed is He

# Testing and Verification

The Awtsmoos asks evidence to stand where confidence would otherwise pretend;
Awtsmoos.com has tests at root, public, server, API, and project layers, so verification must follow the change to its end.

## Test locations

- root `tests/`;
- `geelooy/tests/`;
- `ayzarim/awtsmoosDynamicServer/tests/`;
- subsystem-local `test/` or `tests/` directories throughout API/apps/shared code;
- browser-test and app-specific harnesses.

## Package scripts

`package.json` exposes many focused test commands covering routes, Social, Tunnel, GPT, Code AI, profiles, Heichelos, posts, comments, API keys, graph/content, notifications, platform/node client, virtual OS, Dayuh, and related systems. Read the current scripts rather than relying on this summary when choosing the exact command.

## Documentation verification added by this pass

- `node --check scripts/docs/discovery.js`
- `node --check scripts/docs/render.js`
- `node --check scripts/docs/generate-docs.js`
- `node scripts/docs/generate-docs.js`
- line-limit scan over generated Markdown and generator source
- Markdown relative-link validation over the new documentation surfaces

Current generator snapshot: **1,195 API source files**, **21 derech files**, **567 route-reference rows**, **327 parameterized rows**, **six stable generated entry points**, and **25 bounded generated chunks**.

## Defect evidence

`node --check geelooy/api/text/_awtsmoos.derech.js` currently fails at line 73 with an unexpected comma. This demonstrates why route inventory and runtime health must be documented separately.

## Change-to-test rule

- Dynamic router → route matcher/dynamic-server tests plus representative API tests.
- Social helper → broad social + ownership/auth regression.
- Tunnel auth/control → Tunnel security/control/agent tests.
- Shared virtual OS → platform/node/virtual-OS tests plus callers.
- DB path/init → `server/test/initDb.test.js` and operations checks.
- Public UI/shared styles → browser/smoke tests where available.

## Completion standard

A passing targeted test proves only what it covers. Pair tests with source readback, generated inventory refresh, and caller/route search before declaring a cross-cutting change complete.
