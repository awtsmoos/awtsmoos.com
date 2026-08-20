B"H
Boruch Hashem
Blessed is He

# Street 2 — Phase 2 File Map and Risk Review

> The Awtsmoos reveals that a page graph is not merely a pile of URLs. It is a covenant between remote identity and local execution identity. Awtsmoos.com must preserve both names, rewrite only the references it has actually gathered, and refuse every seductive shortcut that would leak raw network authority back into guest code.

## Proposed Street 2 module graph

```text
remoteResourceGraph.js
	├── remoteResourceAddress.js
	├── remoteHtmlResources.js
	├── remoteModuleResources.js
	├── remoteCssResources.js
	└── remoteImportMap.js
			↓
		injected routed transport
			↓
		Street 1 merkavaProxyTransport
```

The collector returns a **pure data product**:

```text
{
	entry,
	files,
	manifest,
	deferredAssets,
	warnings,
	usage
}
```

No guest code executes in Street 2.

## New production files

### `geelooy/os/programs/awtsmoos-browser/remoteResourceAddress.js`
Responsibilities:
- canonicalize remote URLs with fragments removed,
- preserve query strings in canonical network identity,
- produce deterministic synthetic Merkava file keys,
- prevent cross-origin pathname collision,
- resolve child URL from canonical parent URL,
- expose text-resource kind hints without trusting extension alone.

Proposed key structure:

```text
/__awtsmoos_remote__/<scheme>/<encoded-host>/<effective-port>/<pathname>/<query-suffix>
```

Rules:
- `https://a.test/app.js` and `https://b.test/app.js` must never share a key,
- query variants must not collide,
- fragments are excluded,
- default ports are normalized explicitly,
- trailing slash resources get deterministic document/index key form,
- file key must remain a path, never a URL carrying remote authority.

### `remoteImportMap.js`
Responsibilities:
- merge inline import maps already parsed from the HTML source,
- resolve exact `imports` mappings,
- resolve prefix mappings ending in `/`,
- optionally honor the most-specific matching `scope` prefix,
- leave unresolved bare specifiers as warnings,
- never invent npm/CDN locations.

### `remoteHtmlResources.js`
Responsibilities:
- parse only resource-bearing HTML attributes needed by this street,
- discover external classic/module script `src`, stylesheet `href`, and inline import maps,
- rewrite collected external script/style references to synthetic file keys,
- leave inline scripts/data scripts untouched,
- preserve unrelated markup byte-for-byte as much as practical.

This helper should be narrow rather than modifying `HTMLAssembler.js`, whose current local-file semantics already work.

### `remoteModuleResources.js`
Responsibilities:
- extract static `import ... from`, side-effect imports, and `export ... from`,
- explicitly ignore dynamic `import()` and `require()` in Street 2,
- resolve relative/absolute references from canonical module URL,
- resolve bare specifiers through import map only,
- fetch textual module dependencies through injected transport,
- rewrite successfully collected static specifiers to synthetic file keys,
- preserve unresolved references with explicit warnings instead of guessing.

### `remoteCssResources.js`
Responsibilities:
- extract `@import` text dependencies recursively,
- resolve from canonical stylesheet URL,
- fetch CSS text only,
- rewrite successfully collected `@import` references to synthetic keys,
- record `url(...)` image/font/media assets as deferred metadata without downloading them in Street 2.

### `remoteResourceGraph.js`
Responsibilities:
- own collection queue/visited sets/limits,
- accept top-level HTML text + final page URL + injected transport,
- create the top-level synthetic entry key,
- coordinate HTML, module, and CSS collectors,
- enforce count/depth/per-file/total-byte limits,
- dedupe by canonical final URL,
- retain redirect requested URL -> final URL testimony,
- return `files` plus manifest without executing anything.

## Existing files that should remain untouched in Street 2

- `RuntimeAddress.js`
- `HTMLAssembler.js`
- `CSSAssembler.js`
- `ImportResolver.js`
- `RuntimeAssembler.js`
- `remoteNavigationController.js`
- `runtime.js`
- `browserNavigationCoordinator.js`
- every Chromium interactive file/route
- every Drive proxy/security file

The collector should prove itself in isolation before a later street wires it into navigation/runtime execution.

## Potential existing-file touch only if browser loading requires it

If new modules are imported normally from `remoteNavigationController` only in a later street, no loader edit is needed now.

Street 2 should therefore prefer **new ESM files under the OS browser program** and avoid touching `merkavaLoader.js` unless the collector genuinely needs a new Merkava UMD runtime module. Current evidence says it does not.

## Risk graph

```text
remote URL
	├─ identity collision
	├─ redirect identity drift
	├─ huge response graph
	├─ recursive/cyclic imports
	├─ cross-origin module edge
	├─ query-sensitive variants
	├─ import-map alias ambiguity
	├─ MIME confusion
	└─ secret-bearing body/logging

synthetic file key
	├─ path collision
	├─ query loss
	├─ origin loss
	└─ accidental host URL authority

rewritten source
	├─ over-rewrite strings/comments
	├─ dynamic import accidentally rewritten
	├─ sourcemap/comment corruption
	└─ unresolved specifier hidden
```

## 30 risk improvements / design corrections

1. Canonicalize with the WHATWG `URL` implementation already available in the host browser.
2. Strip URL fragments before fetch identity/deduplication.
3. Preserve query strings in network identity.
4. Encode query strings into synthetic path material rather than using `?` in file keys.
5. Encode scheme, hostname, and effective port into every synthetic remote key.
6. Never use `RuntimeAddress.resolve()` as canonical network identity because it drops origin.
7. Deduplicate by **final canonical URL**, not initial request URL alone.
8. Preserve requested→final redirect aliases in manifest so two redirects to one final file fetch once.
9. Enforce `maxFiles` before enqueueing a new resource.
10. Enforce `maxDepth` independently for module and CSS recursion.
11. Enforce `maxFileBytes` from proxy body testimony before accepting content into `files`.
12. Enforce `maxTotalBytes` across accepted textual resources.
13. Accept only GET resource collection in Street 2.
14. Use explicit Accept headers per kind, but never rely on them for security.
15. Require a 2xx response for collected executable/style text.
16. Reject/record non-textual script/module/CSS MIME responses rather than decoding them blindly.
17. Permit common textual MIME fallbacks for misconfigured servers only through a tested bounded policy.
18. Keep resource bodies out of diagnostic logs; record URL, kind, status, bytes, key.
19. Never expose server cookie values in manifest/warnings.
20. Do not download CSS `url(...)` binary assets in the first Street 2 implementation.
21. Record deferred CSS assets with canonical URL + parent stylesheet only.
22. Parse static module references without matching dynamic `import()`.
23. Parse `export ... from` in addition to static imports.
24. Do not recurse `require()` in browser module collection.
25. Resolve bare specifiers only when import maps provide a mapping.
26. Prefer the most-specific import-map scope before global imports.
27. Exact import-map keys take precedence over prefix keys.
28. Prefix mappings require both key and target to preserve slash semantics.
29. If a mapped URL is malformed, record warning and leave original source unchanged.
30. Rewrite only lexical import/export specifier spans identified by the collector; do not global string-replace module names.
31. Rewrite HTML only for specific `src`/`href` attribute spans belonging to collected resources.
32. If a resource fetch fails, keep its original HTML/module/CSS reference and emit warning; never rewrite to a nonexistent synthetic key.
33. Preserve inline scripts and import-map JSON text exactly.
34. Keep `data:` resources local/unfetched.
35. Do not fetch `blob:`, `javascript:`, `file:`, extension/custom protocols, or scheme-relative URLs without normalizing scheme from parent first.
36. Only `http:`/`https:` may cross the Drive proxy.
37. Treat cycles as normal visited-set termination, not errors.
38. Make queue order deterministic for reproducible tests and manifests.
39. Make file-key generation pure and separately testable.
40. Keep all new implementation files <=120 lines by splitting address/parser/collector responsibilities.
41. Do not modify the large `RuntimeAssembler.js` in Street 2.
42. Do not fix its duplicated functions or dynamic fetch while on this street, even though source review revealed them.
43. Do not execute the collected graph in Street 2 tests; execution belongs to later streets.
44. Do not remove or call Chromium code from Street 2.
45. Ensure the collector is usable in the user's browser with no Node `fs`, `path`, `Buffer`, or `process` dependency.
46. Test through injected fake transport only; no public Internet in unit tests.
47. Include a two-origin same-path collision fixture.
48. Include a redirect dedupe fixture.
49. Include cyclic module and cyclic CSS import fixtures.
50. Include an unresolved bare import fixture proving no guessed CDN fetch occurs.

## Test file map

New tests under `geelooy/os/test/`:
- `awtsmoosBrowserRemoteResourceAddress.test.mjs`
- `awtsmoosBrowserRemoteImportMap.test.mjs`
- `awtsmoosBrowserRemoteResourceGraph.test.mjs`

Optional split if source collectors need focused contracts:
- `awtsmoosBrowserRemoteModuleResources.test.mjs`
- `awtsmoosBrowserRemoteCssResources.test.mjs`

## Phase 2 decision

Street 2 should be implemented as an **isolated pure browser-side collector** that produces a Merkava-ready file graph but does not wire it into navigation or execution yet.

This keeps the one-street rule intact and makes the next street's live-runtime wiring depend on a tested deterministic graph rather than an entangled browser controller change.
