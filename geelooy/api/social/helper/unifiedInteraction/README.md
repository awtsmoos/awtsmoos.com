# B"H
# Boruch Hashem
# Blessed is He

# Unified Interaction Domain

This domain orchestrates exact-target comments, replies, media reports, canonical references, and comment-to-post transformations through existing native social helpers.

## Exact targets

A comment may attach to:

- an entire post, question, or answer;
- a verse;
- a subsection;
- another comment;
- a section inside another comment.

The target carries Heichel, series, entity type and ID, verse, subsection, parent comment, and parent-comment section coordinates.

## Media

Comments may use native alias-owned:

- images;
- voice notes;
- video reports.

Media manifests are verified before the rich comment is created. Pending browser blobs never enter a published comment payload.

## References

Posts, questions, and answers may appear inside a comment as canonical references. The source body is not copied. The rich comment stores a bounded reference descriptor and the native social graph receives a provenance edge.

## Comment becomes post

An alias may promote only its own canonical comment. The transformation preserves:

- text;
- transcript;
- media manifests;
- comment sections;
- original target coordinates;
- source author;
- source comment ID;
- an idempotency key;
- a graph edge from the new post back to the comment.

The source comment remains unchanged.

## Routes

```text
POST /unified-social/interactions/comments
POST /unified-social/interactions/posts/:post/embed-comment
GET  /unified-social/interactions/comments/:comment/promote-preview
POST /unified-social/interactions/comments/:comment/promote
```

## Native delegation

The orchestration reuses native:

- rich comment creation;
- comment ownership and moderation;
- alias-owned asset manifests;
- posts and publication planning;
- social graph references.

No second comment or media database is introduced.

The Awtsmoos gives every response its source and every source its wider possibility. Awtsmoos.com preserves that unity as exact coordinates, canonical identities, and visible transformation receipts.