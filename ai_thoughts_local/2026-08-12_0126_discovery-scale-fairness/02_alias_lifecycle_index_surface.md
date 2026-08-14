B"H

# Discovery Scale & Fairness — Alias Lifecycle & Index Surface

Boruch Hashem — Blessed is He.

This second pass narrows the scale/fairness vision against the source already proven in prior batches while marking every lifecycle/index assumption that must be reread before mutation.

## Known architecture

- Public alias objects live under `/social/aliases/<aliasId>/info`.
- Private ownership lives under `/users/<user>/aliases/<aliasId>`.
- Current public global discovery reads nonrecursive `/social/aliases` child names.
- Current public People browse/search exposes only public handle fields after `getAlias()` strips `user`.
- Anonymous feed/trending uses a bounded public alias window of at most 50 IDs.
- Explicit caller aliases bypass public enumeration.
- Current downside: DosDB directory listing still readdir+stats the namespace before slicing; alphabetical page 1 also biases the anonymous feed.

## Lifecycle questions to prove from source

1. Which exact `_awtsmoos.alias.js` routes create, update, rename, and delete aliases?
2. Do route handlers receive the created/deleted alias ID in a stable success envelope?
3. Can route handlers perform a second small public-index write after helper success without changing helper internals?
4. Does alias update ever change the alias ID, or only public fields?
5. Does alias delete return enough identity to remove an index marker safely?
6. Are create/delete helpers transactional across public and private paths today?
7. Is there an existing pattern for route-level secondary index maintenance elsewhere in the repo?
8. Does DosDB offer atomic multiwrite/batch helpers suitable for marker + alias lifecycle consistency?
9. Can an index record be strictly public, e.g. `{id}` or a marker boolean, with no owner/user field?
10. Can stale index entries be filtered safely through existing public alias detail lookup?
11. Can missing index entries be detected/reconciled without request-time whole-database work?
12. What recovery/repair pattern exists for derived indexes?

## Candidate index shapes

### Minimal marker tree
`/social/publicAliasIndex/<aliasId>` -> `{ indexed: true }` or tiny marker.

Pros:
- lifecycle hook simple;
- no owner data;
- child-name listing yields handles;
- stale marker harmless if card enrichment filters missing alias.

Cons:
- still directory readdir+stats unless sharded.

### Sharded marker tree
`/social/publicAliasIndex/<prefix>/<aliasId>`.

Pros:
- bounded prefix search could avoid whole namespace scan.

Cons:
- browse pagination across shards more complex;
- lifecycle rename/prefix changes matter.

### Page buckets / manifest
Derived fixed-size pages plus generation metadata.

Pros:
- request cost closer to page size.

Cons:
- complex consistency and compaction;
- risky without transactional batch writes.

## Fairness fallback without persistent index

If index lifecycle hooks are not clean enough, use the already safe alias count + a deterministic rotating `aliasPage` derived from UTC time bucket. That improves representation immediately while preserving current privacy semantics and avoiding index inconsistency.

## Files to audit

- `geelooy/api/social/_awtsmoos.alias.js`
- create/update/delete functions in `helper/alias.js` by exact line ranges
- `helper/profile/publicAliases.js`
- `_awtsmoos.publicDiscovery.js`
- DosDB write/delete/batch/multiwrite APIs
- existing secondary index/search index maintenance modules
- tests around alias create/delete lifecycle
- exact line counts and Git status.

The next pass freezes 30+ implementation/consistency gates before any source mutation.
