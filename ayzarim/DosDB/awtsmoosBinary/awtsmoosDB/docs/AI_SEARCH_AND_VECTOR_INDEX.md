<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# AI Search and Vector Index

AwtsmoosDB stores vector payloads and a persisted HNSW graph. The public facade exposes strict indexed search; the Geelooy RAG service supplies lane discovery, local query embedding, read-only sessions, and HTTP provenance.

## Components

- Vector list: canonical stored coordinates and payloads.
- Metadata: dimensions, metric, HNSW parameters, registry and entry node.
- Registry pointers: stable ordering from node ID to persisted graph node.
- HNSW traversal: approximate nearest-neighbor search.
- Hydration: resolve hit keys to payloads.
- Strict route: rejects non-indexed execution.

## Public API rule

Application writers import `index.js`, gaining verified free-space reuse by default. Dedicated strict-search readers may extend `database.js` directly only to enforce read-only, WAL-disabled, shared-lock behavior without writer-side cache hydration.

## Verification

Use direct canonical-vector probes plus HTTP probes. Direct probes prove the persisted graph; HTTP probes additionally prove query embedding, lane resolution, route contracts, session reuse, and provenance.
