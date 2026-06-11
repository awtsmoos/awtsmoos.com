B"H

# Geelooy Living Graph Bridge — Real Code Archaeology

This file records what was actually inspected before changing anything. It is not a fantasy redesign. It is the map of the vessels already present.

## Sacred constraint

The reader, old URLs, old APIs, old posts, old heichelos, old aliases, old comments, old readers, and old series must continue to work. The future must be revealed beside the old doors, not by smashing them.

## Inspected roots

- `package.json`
- `index.js`
- `geelooy/API/social/_awtsmoos.posts.js`
- `geelooy/API/social/_awtsmoos.comments.js`
- `geelooy/API/social/_awtsmoos.profile.js`
- `geelooy/API/social/_awtsmoos.entities.js`
- `geelooy/API/social/helper/profile/*`
- `geelooy/API/social/helper/comments/routes/index.js`
- `geelooy/API/social/helper/comments/richCommentSchema.js`
- `geelooy/API/social/helper/comments/richCommentStore.js`
- `geelooy/API/social/helper/comments/commentPaths.js`
- `geelooy/API/social/helper/entities/entitySchema.js`
- `geelooy/API/social/helper/entityUniverse/*`
- `geelooy/API/social/helper/socialGraph.js`
- `geelooy/API/social/helper/socialContent.js`
- `geelooy/API/social/helper/platform/*`
- `geelooy/@/*`
- `geelooy/scripts/awtsmoos/social/profile/*`
- `geelooy/heichelos/post/postLogic.js`
- `geelooy/heichelos/post/commentLogic.js`
- `geelooy/heichelos/post/comments/inline/*`
- `geelooy/heichelos/heichel/modules/social/sectionedContent.js`

## What already exists

### Server shell

`index.js` boots the Awtsmoos dynamic server on port 8080, with optional mail disabled unless explicitly enabled. This is a clean local dev gate and should not be disturbed.

### Posts

`_awtsmoos.posts.js` makes posts series-bound:

- create/list posts under `/heichelos/:heichel/series/:series/posts`
- read/edit/delete under `/heichelos/:heichel/series/:series/post/:post`
- alias post discovery under `/aliases/:alias/postsMade/...`
- comments warn that standalone post endpoints are deprecated

The system already thinks posts belong in heichel + series coordinates.

### Profiles

`_awtsmoos.profile.js` exposes:

- `/profile/:alias`
- `/profile/:alias/posts`
- `/profile/:alias/comments`
- `/profile/:alias/tree`
- `/profile/:alias/series-tree`
- `/profile/:alias/heichelos`
- write routes under `/alias/:alias/profile`

`helper/profile/index.js` aggregates identity, templates, stats, posts, comments, heichelos, tree, activity, and pinned.

`helper/profile/posts.js` is important: it reads from three ages of the system:

1. packed all-posts census
2. legacy postsSubmitted indexes
3. connected heichel/series scans

This means the profile layer already respects migration history.

`helper/profile/comments.js` exposes comments with heichel, series, post, verseSection, segmentId, content, reply count, and likes count.

The backend profile is already a contribution graph. The frontend is still mostly tabs.

### Public profile UI

`geelooy/@/_awtsmoos.derech.js` serves a thin shell for `/@alias`.

`geelooy/scripts/awtsmoos/social/profile/render.js` renders:

- hero
- stats
- tabs
- posts
- comments
- heichelos
- tree
- activity

The frontend is simple and mobile conscious, but does not yet expose the deeper graph nature of the data.

### Comments

`_awtsmoos.comments.js` is a thin manifest delegating to `helper/comments/routes/index.js`.

The comment routes combine old routes and new rich routes.

`richCommentSchema.js` already models comments as small posts:

- content
- audioNoteText
- verseSection
- subsectionId
- parentSectionId
- assets
- sections
- links
- previews
- mood

`richCommentStore.js` provides:

- unique comment URLs
- create/read by ID
- children and recursive trees
- root children indexes
- verse indexes
- subsection indexes
- delete previews for verse/subsection
- recursive tombstones

This is the core of first-class comments.

### Reader comments

`post/commentLogic.js` currently uses query parameters `idx` and `sub` to switch active verse/subsection commentary. It loads commentator aliases, then renders alias-specific insight tabs.

`post/comments/inline/coordination/UnifiedOrchestrator.js` gathers inline aliases and manifests inline commentary through anchor guardians.

`post/comments/inline/anchors/*` supports resolving anchors, fingerprints, range highlighting.

This proves the reader already has social anchoring, but it is fragmented between old side/tab commentary and newer inline manifestation.

### Entity systems

There are two overlapping entity grammars.

#### `helper/entities/entitySchema.js`

Focused on post/question/answer as social content records. Supports:

- plain or structured mode
- verses
- subsections
- assets
- answer parent question ID

#### `helper/entityUniverse/universeSchema.js`

Broader recursive universe. Supports:

- post, question, answer, comment, heichel, series, collection, poll, event, project, task, notification, conversation, mailThread, asset, draft, profile, world
- nodes: root, verse, section, subsection, segment, media, quote, question, answer, note
- edges: references, answers, quotes, derivedFrom, forkedFrom, mergedInto, translates, extends, opposes, supports, contains, dependsOn, duplicates, corrects, respondsTo, mentions, usesAsset

`universeStore.js` supports writing, reading, listing, linking, adding children, snapshotting, forking, and materializing DNA.

`rangeReferences.js` supports live range references from source entities into target entities while preserving source comment pointers.

This is extremely close to the desired civilization model already.

### Social graph

`socialGraph.js` gives older graph primitives:

- allowed entity types include post, question, answer, comment, section, series, heichel, alias, repost, citation, collection
- reference kinds include references, reposts, quotes, answers, crossLinks
- entities have inbound and outbound reference folders

This overlaps with the universe edge system.

### Social content

`socialContent.js` tries to unify posts/questions/answers as entities while mirroring to legacy paths:

- writes post record to legacy post path
- writes series index
- writes alias submitted index
- writes heichel contribution index
- writes sections
- mirrors to packed post engine
- links answers to questions through graph references

This is likely the real bridge layer, but it still uses the smaller entity schema while `entityUniverse` has the bigger grammar.

### Platform/search/feed

`platform/search.js` is token search over packed store.

`platform/feedRoutes.js` provides home, heichel, trending, discover from packed posts and graph edges.

`platform/graphTransactions.js` batches graph edges with validation and audit journaling.

These are functional foundations, not yet full discovery civilization.

## Main architectural truth

The future is already split across multiple vessels:

1. legacy paths
2. series-bound post APIs
3. profile aggregator
4. rich comments
5. inline reader anchors
6. socialContent entity bridge
7. socialGraph edges
8. entityUniverse recursive DNA
9. packed/search/feed platform

The task is not invention. It is unification.

## The first real bridge

The safest first bridge is a read-only adapter that creates one normalized public shape from old and new systems:

`LivingEntityView`

It should not write. It should not migrate. It should not break old routes. It should only normalize existing data into one shape.

Every future UI can consume this without touching old storage.

## Proposed normalized surface

```js
{
  identity: {
    type,
    id,
    heichelId,
    seriesId,
    aliasId,
    legacyKind,
    canonicalUrl,
    legacyUrls
  },
  content: {
    title,
    summary,
    rootContent,
    sections,
    assets
  },
  social: {
    comments,
    commentsByVerse,
    commentsBySubsection,
    commentCount
  },
  graph: {
    inbound,
    outbound,
    references,
    answers,
    citations,
    forks
  },
  navigation: {
    parent,
    children,
    seriesPath,
    heichelPath,
    readerUrl
  },
  preservation: {
    readOnly: true,
    sourceSystems,
    missingSystems,
    warnings
  }
}
```

## Step order

1. Create read-only adapter modules.
2. Add tests proving old post/comment/profile routes still load.
3. Add API endpoint for entity view without replacing old endpoints.
4. Let profile page consume enriched read-only fields.
5. Let heichel page consume enriched read-only fields.
6. Let reader expose richer social layers using existing inline guardians.
7. Only later add write bridges or migrations.

## Red flags

- `socialGraph` and `entityUniverse` duplicate graph concepts.
- `entities/entitySchema.js` and `entityUniverse/universeSchema.js` duplicate entity concepts.
- profile frontend is tab-based while backend is graph-like.
- rich comments have unique URLs, but profile comment card still links to a guessed old route with `?verse=` rather than a comment URL.
- reader commentary uses both old `idx/sub` and newer verse/subsection anchors.
- `socialContent.js` appears truncated in inspection and must be fully read before modification.

## First implementation target

Add read-only `helper/livingEntityView/` modules, all tiny, no mutation, no route replacement.

This bridge is the quiet Kav: it reveals one living graph without destroying any old vessel.
