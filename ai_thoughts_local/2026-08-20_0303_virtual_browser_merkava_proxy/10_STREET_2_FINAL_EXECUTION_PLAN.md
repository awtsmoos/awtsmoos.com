B"H
Boruch Hashem
Blessed is He

# Street 2 — Phase 3 Final Execution Plan

> The Awtsmoos has revealed enough of the street to walk it without guessing. Awtsmoos.com will now build a collector that knows two truths at once: where a resource truly lives on the remote web, and where its safe local shadow lives inside Merkava.

## Exact Street 2 goal

Given:
- already-fetched top-level HTML text,
- its final canonical page URL,
- the proven Street 1 routed transport,

produce a bounded, deterministic, execution-ready **text resource graph**:

```js
{
	entry,
	files,
	manifest,
	deferredAssets,
	warnings,
	usage
}
```

Street 2 does not execute that graph.

## Exact production files to create

All new files live under:
`geelooy/os/programs/awtsmoos-browser/`

### 1. `remoteResourceAddress.js`
Exports:
- `canonicalRemoteUrl(value, base?)`
- `remoteFileKey(value, base?)`
- `resolveRemoteUrl(specifier, parentUrl)`

Algorithm:
- WHATWG URL normalize,
- allow only `http:`/`https:`,
- strip fragment,
- preserve query in canonical URL,
- file key contains scheme + encoded hostname + effective port + normalized path + encoded query suffix,
- path remains synthetic local path, never executable host URL.

### 2. `remoteImportMap.js`
Exports:
- `importMapFromHtml(html, pageUrl)`
- `resolveMappedSpecifier(specifier, parentUrl, importMap)`

Algorithm:
- parse inline `<script type="importmap">` JSON only,
- merge `imports` and `scopes` in document order,
- resolve mapping targets relative to page URL,
- select most-specific scope matching parent URL,
- exact key before longest prefix key,
- unresolved bare specifier returns null,
- relative/absolute URL-like specifier resolves without map.

### 3. `remoteHtmlResources.js`
Exports:
- `htmlResourceRefs(html, pageUrl)`
- `rewriteHtmlResources(html, replacements)`

Resource refs:
- external `<script src>` whose type is classic/module or absent,
- `<link rel="stylesheet" href>`.

Each ref includes:
- kind,
- module flag,
- original specifier,
- canonical requested URL,
- precise source span for attribute value.

Rewriting:
- only successful collected refs,
- replacements applied from highest source index downward,
- inline scripts/importmaps/data scripts untouched.

### 4. `remoteModuleResources.js`
Exports:
- `staticModuleRefs(source, moduleUrl, importMap)`
- `rewriteModuleRefs(source, replacements)`

Recognize only:
- static `import ... from`,
- side-effect `import "..."`,
- `export ... from`.

Explicitly exclude:
- dynamic `import()`,
- `require()`.

Each ref contains exact specifier span and either canonical URL or unresolved-bare warning state.

### 5. `remoteCssResources.js`
Exports:
- `cssImportRefs(source, stylesheetUrl)`
- `cssAssetRefs(source, stylesheetUrl)`
- `rewriteCssImports(source, replacements)`

Street 2 fetches only CSS `@import` text recursively.
`url(...)` assets are recorded in `deferredAssets` and left unchanged.

### 6. `remoteResourceGraph.js`
Exports:
- `collectRemoteResourceGraph(options)`

Inputs:
- `html`
- `pageUrl`
- `transport`
- optional limits

Default limits:
- max files: 64
- max module depth: 12
- max CSS depth: 8
- max file bytes: 1 MiB
- max total accepted text bytes: 6 MiB

Algorithm:
1. Normalize final page URL.
2. Create synthetic entry key and seed `files[entry] = html`.
3. Parse import map from original HTML.
4. Discover external HTML script/style refs.
5. Fetch each through injected routed transport, sequentially for deterministic testimony.
6. Use proxy result final URL as canonical resource identity.
7. Generate synthetic key from final URL.
8. For module resources, recursively collect static refs and rewrite only successful ones.
9. For CSS resources, recursively collect `@import`; record `url(...)` assets as deferred.
10. Rewrite top-level HTML references only after successful collection.
11. Save rewritten top-level HTML at `files[entry]`.
12. Return deterministic manifest/warnings/usage.

## Transport contract

Collector calls only:

```js
await transport({
	method: "GET",
	headers: { accept: "..." },
	url: canonicalUrl
})
```

Expected result uses existing proxy testimony:
- `url`
- `status`
- `headers`
- `text`
- `bodyBase64`

Collector never accesses cookie values.

## MIME/text acceptance policy

A resource is accepted only when:
- status is 2xx,
- `text` is a string,
- accepted byte estimate <= remaining limits.

Kind-specific common MIME evidence may be recorded but Street 2 should not reject a textual resource solely because a real server mislabeled it as `text/plain` or `application/octet-stream` if the proxy already supplied decoded `text`.

This policy is pragmatic and bounded; binary-only responses have `text == null` and are rejected/deferred.

## Manifest row shape

Each accepted resource row should contain only non-secret testimony:

```js
{
	kind,
	requestedUrl,
	url,
	fileKey,
	status,
	bytes,
	depth
}
```

No request/response body content, Cookie, or Set-Cookie values belong in manifest.

## Test files to create

### `awtsmoosBrowserRemoteResourceAddress.test.mjs`
Cases:
1. same pathname on two origins gives different keys,
2. http/https differ,
3. effective ports differ correctly,
4. query variants differ,
5. fragments do not affect identity,
6. relative resolution uses canonical parent.

### `awtsmoosBrowserRemoteImportMap.test.mjs`
Cases:
1. exact global mapping,
2. longest prefix mapping,
3. most-specific scope,
4. relative target resolution,
5. unmapped bare specifier returns null,
6. malformed import-map JSON is ignored with bounded behavior.

### `awtsmoosBrowserRemoteResourceGraph.test.mjs`
One deterministic fake graph must cover:
- HTML classic script,
- HTML stylesheet,
- HTML cross-origin module entry,
- static relative module dependency,
- `export ... from`,
- import-map bare alias,
- dynamic import left untouched,
- nested CSS `@import`,
- CSS `url(...)` deferred,
- cyclic module dependency,
- cyclic CSS import,
- two origins sharing pathname,
- redirect final URL,
- unresolved bare module warning,
- request dedupe,
- file-count/byte limit failure/warning behavior,
- zero code execution.

## 35 final implementation checks before writing code

1. New files only; do not modify Street 1 unless a test proves a defect.
2. No existing Merkava runtime source edit in Street 2.
3. No navigation/controller edit.
4. No Chromium file/route edit.
5. No server proxy edit.
6. All collectors are ESM browser-safe.
7. No Node `Buffer`.
8. No Node `path`.
9. No Node `fs`.
10. No `process`.
11. No raw global cross-origin fetch.
12. All network calls go through injected transport.
13. HTTP(S) only.
14. Fragment stripped from canonical fetch identity.
15. Query preserved in canonical identity.
16. Origin encoded into file key.
17. Effective port encoded into file key.
18. Query encoded into path suffix, not file-key query syntax.
19. Sequential deterministic collection.
20. Visited-set cycle termination.
21. Final URL used as child-resolution base after redirect.
22. Rewrites occur only after successful resource acceptance.
23. Failed refs remain original.
24. Inline scripts unchanged.
25. Import-map text unchanged.
26. Dynamic imports unchanged.
27. `require()` unchanged.
28. CSS binary asset refs unchanged but recorded.
29. Static module source rewrite uses precise spans, descending order.
30. HTML attribute rewrite uses precise spans, descending order.
31. CSS import rewrite uses precise spans, descending order.
32. No body content in manifest/warnings.
33. Per-file/total/file-count/depth budgets tested.
34. Every production file <=120 lines.
35. Every production file gets syntax check + focused tests + Chromium/CDP source scan.

## Validation order — one command/action at a time

1. Fresh read each existing source immediately before any necessary rewrite. Current plan requires no existing source rewrite.
2. Create address helper.
3. Syntax-check address helper.
4. Create/import-map helper.
5. Syntax-check import-map helper.
6. Create HTML helper.
7. Syntax-check HTML helper.
8. Create module helper.
9. Syntax-check module helper.
10. Create CSS helper.
11. Syntax-check CSS helper.
12. Create graph collector.
13. Syntax-check graph collector.
14. Write address tests and run them.
15. Write import-map tests and run them.
16. Write graph tests and run them.
17. Run Street 1 focused tests again.
18. Run existing Merkava advanced regression.
19. Run existing six non-Chromium proxy/security suites.
20. Read back every Street 2 production/test file.
21. Verify line counts from fresh reads or one scoped command.
22. Scan Street 2 production files for Chromium/CDP/raw-network markers.
23. Write post-implementation delta/evidence ledger.
24. Stop at Street 2 boundary.

## Street 2 stop gate

Even after collection passes, **do not wire it into `remoteNavigationController`, `runtime.js`, or `RuntimeAssembler` in this street**.

The next street must reassess how the collected graph is handed into a live client-side Merkava runtime, and separately confront browser static-module execution. This preserves the user's one-street-at-a-time rule and prevents resource loading from becoming entangled with execution or Chromium removal.
