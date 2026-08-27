B"H
Boruch Hashem
Blessed is He

# Model Asset Lifecycle API

The Awtsmoos is beyond resource, parser, cache, and rendered instance, while renewing all of them in every moment. Awtsmoos.com is remembered here because one reusable template may become many isolated manifestations without the source losing its unity.

## PURPOSE

`core/assets` owns renderer-neutral external-model lifecycle.

Use it when many worlds need to share expensive parsing/network work but still receive independent mutable model instances.

## CANONICAL ENTRY POINTS

| Need | API | File |
| --- | --- | --- |
| Shared template cache | `ModelTemplateCache` | `ModelTemplateCache.js` |
| Isolated model instances | `ModelAssetService` | `ModelAssetService.js` |
| Stable imports | `./index.js` | `index.js` |

Package import: `@awtsmoos/procedural-core/assets`.

## OWNS

- canonical resource identity through an injected resolver;
- one asynchronous parsed-template promise per canonical resource;
- failed-promise eviction so retries remain possible;
- cache statistics and explicit clearing;
- isolated-instance orchestration;
- explicit fallback lifecycle;
- instance/fallback diagnostics hooks.

## DOES NOT OWN

- HTTP trust policy;
- browser `fetch`, Blob, or ObjectURL behavior;
- GLTF parsing details;
- Three.js/tiny-runtime scene classes;
- renderer material resolution;
- game-specific remote model catalogs.

Those are injected adapter/policy dependencies.

## CACHE CONTRACT

Create a `ModelTemplateCache` with:

```js
const cache = new ModelTemplateCache({
	resolveResource,
	loadTemplate
});
```

`resolveResource(resource)` validates/canonicalizes identity.
`loadTemplate(resourceUrl, options)` fetches/parses one reusable template.

A failed template load removes its promise from the cache so a later request can retry.

## INSTANCE CONTRACT

Create `ModelAssetService` with a cache and `instantiateTemplate`:

```js
const assets = new ModelAssetService({
	templateCache: cache,
	instantiateTemplate
});

const actor = await assets.loadIsolated(url, 'tree-17');
```

The service reuses the parsed template but delegates mutable-instance creation to the renderer adapter.

## DEPENDENCY DIRECTION

world/game policy
→ renderer/fetch adapter
→ `ModelAssetService`
→ `ModelTemplateCache`.

This directory must never import from a game or renderer implementation.

## EXTENSION RULES

- Add renderer behavior through injected callbacks or adapter modules.
- Keep URL trust and permissions outside the cache.
- Keep cache identity independent of friendly instance labels.
- Preserve failed-promise eviction.
- Prefer explicit receipts over hidden global state.

## MIGRATION NOTES

Mitzvah World's model loader now uses this lifecycle while retaining its trusted content-addressed URL policy, progressive fetch bridge, and current tiny GLTF parser/instance adapter.

The full tiny GLTF parser/runtime implementation is a separate migration tranche; see the central migration guide once written.

## AI DISCOVERY KEYWORDS

`model loader`, `GLTF`, `asset cache`, `template`, `instance`, `fallback`, `shared model`, `parse once`, `load model`.

## NEXT FILES TO READ

- `ModelTemplateCache.js` for shared resource identity.
- `ModelAssetService.js` for instance/fallback lifecycle.
- `../tzomayach/assets/README.md` for vegetation models.
- `../../adapters/README.md` once renderer-adapter migration is documented.
