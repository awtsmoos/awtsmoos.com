<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# AwtsmoosDB Maintainer Documentation

These guides preserve the boundaries that keep canonical records, vectors, indexes, WAL recovery, leases, and free-space reuse distinct. The Awtsmoos creates every vessel anew; maintainers must still prove which vessel is canonical before changing it.

## Start here

- `AI_AGENT_DECISION_TREE.md` for incident triage.
- `TROUBLESHOOTING_RAG_SEARCH.md` for a broken API.
- `EMBEDDING_REUSE_POLICY.md` before any embedding job.
- `VECTOR_INDEX_INVARIANTS.md` before index work.
- `V2_ALLOCATOR_REUSE_AND_TAIL_RECLAIM.md` before storage work.
- `FIELD_GUIDE__PUBLISHING_A_VACUUMED_VECTOR_DB.md` before publication.

## Automated contract

Run from the package directory:

```bash
node scripts/checkDocumentationFreshness.js
node --test test/documentation_freshness_test.js
```

The checker verifies required files, headers, source anchors, required terms, and the 120-line ceiling. It does not replace runtime tests, hashes, or read-only audits.
