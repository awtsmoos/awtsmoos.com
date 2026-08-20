B"H
Boruch Hashem
Blessed is He

# Street 2 — Phase 1 Source Reassessment

> The Awtsmoos now reveals the second street: not another browser, not another executor, but a cartographer. Awtsmoos.com must gather the remote page's textual vessels through the proven proxy and lay them into Merkava's file world without confusing two origins that happen to share one pathname.

## Street boundary

Street 2 is **bounded remote resource graph collection only**.

It may collect and normalize:
- the already-fetched top-level HTML document,
- external classic scripts,
- external module entry scripts,
- static module dependencies,
- stylesheet links,
- nested CSS `@import` stylesheets,
- import-map mappings needed to locate static modules.

It must **not** yet:
- execute static ES modules in the browser,
- replace navigation wiring,
- add `window.open()`,
- remove Chromium-era files/routes,
- route RuntimeAssembler dynamic imports,
- download arbitrary CSS `url(...)` binary assets,
- mutate the server proxy/security subsystem.

## Fresh source evidence

### `HTMLAssembler.js`
- Reads HTML from `files[entry]` synchronously.
- Discovers classic/module/importmap/data script tags.
- External script execution expects `files[step.resolved]` already populated.
- Discovers stylesheet links and expects those stylesheet file keys already populated.
- Inline import maps are parsed there.

Conclusion: resource collection must finish **before** `RuntimeAssembler.assemble()` / `run()`.

### `RuntimeAssembler.js`
- Constructs `HTMLAssembler` and `CSSAssembler` synchronously from one completed `files` map.
- External scripts are read directly from `this.files[step.resolved]`.
- CSS assembly is also file-map based.
- Browser static-module execution is a later street because browser `executeVmFiles` is still absent.
- Its existing dynamic-import collector calls raw host `fetch()` and is explicitly deferred; Street 2 must not couple to it.

Conclusion: Street 2 should produce a finished deterministic file graph but not invoke execution.

### `RuntimeAddress.js`
- Converts absolute URLs to **pathnames** for Merkava file keys.
- This is useful for local runtime addressing but loses remote origin identity.
- Two remote origins can legitimately have `/app.js`, so pathname alone cannot be the collector's canonical identity.

Conclusion: Street 2 requires dual identity:
1. canonical remote URL for fetching/deduplication/policy,
2. synthetic Merkava file key for the local file graph.

### `ImportResolver.js`
- Parses static imports, side-effect imports, dynamic imports, and `require()`.
- Resolves bare specifiers as `package:<name>` unless another layer handles them.
- Does not parse `export ... from`.

Conclusion: Street 2 must use an explicit **static-only** module reference extractor. It may reuse ImportResolver ideas, but it must not recurse dynamic imports or `require()` and must add `export ... from` support.

### Import-map search
- No separate import-map resolver exists.
- Import maps are parsed/merged only inside HTML/RuntimeAssembler code.

Conclusion: the collector needs one small deterministic import-map resolver for static collection. It must support exact/prefix `imports` mappings first and bounded `scopes` handling only if tests justify it.

### `CSSAssembler.js`
- Already extracts recursive `@import` references and `url(...)` assets from populated CSS files.
- Missing CSS imports/assets become warnings.

Conclusion: Street 2 should collect stylesheet text and recursive `@import` text. CSS binary/image/font `url(...)` bodies are not required for the first executable-resource proof; they can be recorded as deferred assets.

### Existing resource-collector search
- No existing remote collector was found.
- Only `HTMLAssembler` and `RuntimeAssembler` consume the file graph.

Conclusion: a new host-side browser resource collector is justified.

## Core invariants

1. Every remote fetch uses the already-proven host `merkavaProxyTransport` / Drive proxy seam.
2. No guest resource fetch uses host raw cross-origin `fetch`.
3. Remote canonical URLs remain visible to collector bookkeeping, never collapsed to pathname for deduplication.
4. Merkava receives synthetic local keys that cannot collide across origins.
5. The top-level HTML is rewritten only where necessary to point external executable/style references at synthetic local keys.
6. Static module source is rewritten only for import/export specifiers that have been successfully collected into synthetic keys.
7. Dynamic `import()` stays untouched in Street 2.
8. Bare specifiers without an import-map mapping remain unresolved testimony; do not guess npm/CDN locations.
9. Resource counts, recursion depth, per-file bytes, and total bytes are bounded before network collection begins.
10. Only textual executable/style resources enter this Street 2 graph.
11. Redirect final URLs become the canonical identity for subsequent relative resolution.
12. The collector must preserve response MIME/status testimony without surfacing cookie material.
13. Existing `RuntimeAddress`, `HTMLAssembler`, `CSSAssembler`, and `ImportResolver` should remain unchanged unless a focused test proves a shared correction is required.
14. No Chromium/CDP concept belongs in Street 2.

## Proposed identity model

A remote resource has two names:

```text
canonicalUrl = https://cdn.example.com/pkg/app.js?v=4
fileKey     = /__awtsmoos_remote__/https/cdn.example.com/443/pkg/app.js/~q~/v%3D4
```

The exact encoding should be implemented in one small helper and tested for:
- http vs https,
- explicit/non-default ports,
- same pathname on two origins,
- query variants,
- relative child resolution,
- fragments excluded from network identity.

The collector should rewrite external HTML/module/CSS references to these synthetic file keys so existing Merkava assemblers can operate locally without needing remote-origin awareness.

## First proof fixture

Street 2 should first prove a deterministic fake page graph:

```text
https://site.test/index.html
  -> /classic.js
  -> /styles/main.css
       -> ./theme.css
  -> https://cdn.test/app.mjs
       -> ./dep.mjs
       -> import-map bare alias "lib" -> https://cdn.test/lib/index.mjs
```

Expected result:
- all textual resources fetched exactly once through injected fake transport,
- canonical URLs retained in manifest,
- synthetic file keys unique,
- HTML/script/module/CSS references rewritten to collected keys,
- dynamic import left untouched,
- binary CSS asset references merely recorded/deferred,
- no code executed.

## Stop condition for Phase 1

Source reassessment is sufficient to plan the collector. No production implementation should begin until Phase 2 file/risk map and Phase 3 exact execution plan are both persisted.
