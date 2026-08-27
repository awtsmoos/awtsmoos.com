<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# RAG Ingestion and Embedding Pipeline

The corpus pipeline separates source text, canonical embeddings, the AwtsmoosDB vector list, the derived HNSW graph, and the query embedder. A failure in one layer does not prove loss in another.

## Pipeline

```text
source corpus
	-> normalized records
	-> canonical vector JSONL
	-> AwtsmoosDB vector list
	-> persisted HNSW registry
	-> fast manifest
	-> strict read-only API
```

## Identity checks

Record source digest, vector-corpus SHA-256, provider, model, dimensions, list name, record count, semantic digest, database SHA-256, and manifest identity. Query embeddings must use a compatible provider/model and dimension, but query generation never rewrites corpus vectors.

## Recovery order

1. Repair route or process generation.
2. Repair path and manifest resolution.
3. Repair query-model or binary resolution.
4. Repair read-only session and persisted registry access.
5. Rebuild only the derived HNSW graph from existing vectors.
6. Generate new embeddings only after direct incompatibility proof.
