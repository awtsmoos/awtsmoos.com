# B"H — Reality WorldGraph → Procedural Definition Bridge

Boruch Hashem. Blessed is He.

The Awtsmoos renews the whole before a world can appear as nodes, edges, kinds, and seed;
Awtsmoos.com keeps each truthful vessel distinct while one deterministic bridge joins what authors need.

## Purpose

The Reality WorldGraph bridge connects two existing canonical authorities without introducing another authoring language:

- `awtsmoos.world-graph.v1` remains Reality world/topology truth.
- `awtsmoos.procedural-language/1` remains per-entity semantic Definition truth.
- `reality-world-graph-definition-bridge/v1` is only a deterministic transformation receipt between them.

The bridge deliberately preserves more semantic graph information than current Reality execution can realize. A relationship can therefore remain valid semantic data even when no compiler or runtime adapter executes it yet.

## Direct usage

```js
import {
	createWorldGraphDefinitionBundle
} from '../src/core/proceduralLanguage/reality/WorldGraphDefinitionBridge.js';

const receipt = createWorldGraphDefinitionBundle({
	rootSeed: 613,
	nodes: [
		{ id: 'terrain', type: 'terrain', options: { biome: 'mountain' } },
		{ id: 'moss', type: 'moss', growingOn: 'terrain' }
	]
});

const moss = receipt.definitionsById.moss;
```

Direct import is intentional in the first tranche. Shared package barrels and Creation Portal authorities remain untouched while concurrent universal-API work owns those files.

## Receipt contract

The returned frozen receipt contains:

- `bridge` — `reality-world-graph-definition-bridge/v1`.
- `version` — bridge contract version.
- `graph` — canonical frozen WorldGraph document.
- `definitions` — canonical procedural Definitions in authored node order.
- `definitionsById` — frozen null-prototype lookup keyed by stable node id.
- `diagnostics` — factual projection evidence, never speculative compiler support claims.

The canonical graph and Definitions are JSON-safe data, so the receipt can be serialized for transport, inspection, or deterministic tooling.

## Node mapping

| WorldGraph node | Procedural Definition |
| --- | --- |
| `id` | `id` |
| `type` | `kind` |
| normalized/derived seed | canonical string `seed` |
| `options` | `payload` |
| `constraints` | `constraints` |
| relationships | canonical `relationships` |
| `metadata` | `metadata` unchanged |
| domain/profile/source/capability requirements/original provenance | `extensions.realityWorldGraph` |

Bridge lineage is recorded through procedural provenance. Graph-wide defaults, metadata, and provenance remain graph context rather than being copied into every node Definition.

## Seed law

The bridge reuses Reality's existing deterministic seed authority:

1. Explicit node seed → `normalizeRealitySeed(node.seed)`.
2. Missing node seed → `deriveRealitySeed(rootSeed, 'reality-intent', type + ':' + id)`.
3. `createProceduralDefinition` then stores that deterministic value as the canonical Definition seed string.

Node array order never participates in derived seed identity, so reordering identified nodes does not perturb their seeds.

## Relationship law

WorldGraph relationship meaning is preserved independently of runtime support.

- Local string target → canonical `from` and `to` ids.
- External string target → string `to` remains intact and metadata records externality.
- Structured external target → canonical `to` becomes `null`; the exact target remains under `metadata.realityWorldGraph.target`.
- Relationship `options` become canonical relationship `values`.

Structured endpoints therefore never collapse into lossy strings such as `[object Object]`.

## Incremental-regeneration consequence

Node Definitions intentionally exclude unrelated graph-wide metadata. This preserves locality: changing world documentation or unrelated graph metadata does not mutate every node's semantic Definition. Future semantic-hash/dependency infrastructure can therefore cache and regenerate node artifacts independently while separately tracking world topology.

Graph defaults are not expanded during this bridge. Default resolution is planning/compiler policy and belongs in a later stage rather than semantic projection.

## What this bridge does not do

- It does not replace WorldGraph.
- It does not replace ModelingDocument or ProceduralObject.
- It does not register a new universal language.
- It does not infer traits from Reality nouns.
- It does not translate capability requirements into artifact requests prematurely.
- It does not claim unsupported relationships execute.
- It does not choose a compiler.
- It does not mutate the public Creation Portal API.

## Verification evidence

The bridge has been verified by an adversarial targeted test covering hostile ids, structured external targets, reorder-stable seeds, graph-metadata isolation, immutability, and JSON serialization. Existing Reality WorldGraph parity/planning/execution tests pass, and all 18 `proceduralLanguage*.test.mjs` files pass with the bridge present.

## Future integration

The next safe layers are intentionally separate:

- semantic hashes and world/node dependency receipts;
- cache keys and incremental-regeneration planning;
- a Reality compiler capability that consumes canonical Definitions;
- public discovery/export once concurrent ownership of shared authorities is clean;
- cross-document external relationship resolution.

The bridge is therefore foundation, not finale: graph truth descends into semantic Definition without erasing the world that gave it birth.
