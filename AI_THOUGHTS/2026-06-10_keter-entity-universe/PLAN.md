B"H

# Keter Entity Universe Implementation

## Burn-down list
1. Add generic recursive entity universe schema/store for every type: post, question, answer, comment, heichel, series, asset, mail thread, collection, task, event, draft.
2. Add universal graph edges with typed relationships and entity DNA: ancestors, descendants, references, forks, snapshots.
3. Add recursive content node store replacing verse/subsection as a special case while preserving old fields.
4. Add entity routes for create/read/tree/link/fork/snapshot/search-like listing.
5. Add UI shell for entity view using the new store.
6. Add tests that create many entity types, recursive children, links, snapshots, forks, and comment trees.

## Safety
No legacy deletion. All new writes are additive. Existing post/question/answer APIs remain compatible. Comments still use entity id as postId until later deeper unification.
