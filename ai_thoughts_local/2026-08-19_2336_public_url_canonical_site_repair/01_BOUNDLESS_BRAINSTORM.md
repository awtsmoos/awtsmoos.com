B"H

# 01 — Boundless Brainstorm: A URL Must Not Outrun Its Proof

Boruch Hashem. Blessed is He.

The Awtsmoos creates every route, file, mapping, and response anew. Awtsmoos.com therefore must never let the mere shape of a URL become stronger testimony than the authority and runtime evidence beneath it.

## Incident reality

The broken receipt was:

`https://awtsmoos.com/os/asdf/sites/awtsmoos-bounce/index.html`

The hosted source exists, yet that URL is externally 404. The storage write succeeded; publication did not.

The live native source reveals why an agent could be confused: `geelooy/api/tunnel/control/routes/osFs/publicUrls.js` builds generic OS/app/user navigation candidates for every Virtual-OS path. `writeOps.js` returns that report under the field name `publicUrl`, even though the nested verification plan correctly says every candidate is untrusted until probed.

## Ideal semantic universe

Every hosted filesystem receipt should distinguish these different things explicitly:

- `workspacePath`: where the hosted bytes live.
- `navigationCandidates`: possible UI/application routes to inspect those bytes.
- `navigationVerified`: whether any candidate was actually proven.
- `siteDraft`: website-specific metadata only when a path belongs under `<alias>/sites/<siteId>`.
- `canonicalCandidate`: the expected `/sites/<alias>/<siteId>/` site route shape, still untrusted until publication.
- `publicationRequired`: whether canonical Drive sync/site mapping is still required.
- `canonicalUrl`: absent or null until the site publication layer returns it.
- `canonicalVerifiedLive`: false until external expected-content verification succeeds.

A storage write should never imply canonical publication.

## Website-draft recognition

A path such as:

`asdf/sites/awtsmoos-bounce/index.html`

can be classified structurally as:

- alias: `asdf`
- siteId: `awtsmoos-bounce`
- hosted workspace root: `asdf/sites/awtsmoos-bounce`
- inner source path: `index.html`
- canonical candidate: `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`
- publication required: true
- canonical verified live: false

But structural recognition cannot prove a Drive site mapping exists. Only the canonical publication service can do that.

## Compatibility possibilities

### A — Rename `publicUrl` immediately

Replace it with `routeCandidates` or `navigation`. Cleanest semantics, but potentially breaks unknown external consumers.

### B — Keep `publicUrl` but make it unmistakably non-authoritative

Preserve the field temporarily while returning:

- `kind: "navigation-candidates"`
- `trusted: false`
- `canonicalUrl: null`
- explicit verification plan
- optional `siteDraft`

Add a sibling `routeCandidates` field as the preferred contract. This protects current callers while preventing agents from interpreting candidates as publication.

### C — Website paths return no generic OS candidates

For `<alias>/sites/<siteId>`, suppress generic routes entirely and report only website-draft publication state. Strong safety, but could remove useful OS navigation links.

### D — Separate generic navigation and site-publication modules

Keep generic candidate generation in `publicUrls.js` or rename later, and add a small `siteDraftRoutes.js` classifier. `writeOps.js` composes both into one truthful receipt. This keeps responsibilities small and gives website semantics their own testable law.

## Preferred direction before critique

Prefer B + D:

- preserve compatibility deliberately;
- introduce explicit navigation semantics;
- classify site drafts separately;
- never manufacture a final canonical URL from storage state;
- keep canonical publication authority in existing Drive/site services;
- require actual HTTP expected-content verification before live status.

## Agent-facing invariant

Any agent receiving a filesystem receipt must be able to answer:

1. What bytes changed?
2. Where do they live?
3. Which navigation routes are only candidates?
4. Is this path a website draft?
5. Is canonical publication still required?
6. Did the server publication layer return a canonical route?
7. Was that route externally verified against expected site content?

If the answer to 6 or 7 is no, the agent must not say “your public website is live.”

## Publication remains separate

The correct publication transition is already real:

`POST /api/social/drive/:aliasId/actions/bootstrap-site-project`

It performs bounded source publication, project reconciliation, owned site mapping, testimony, and workspace receipt generation. It requires `drive.write + drive.public`.

The existing Awtsmoos Bounce source contains 25 public source files, all local and within the 64-file / 2 MiB manifest policy. `.awtsmoos/*` remains private metadata and must never enter the public manifest.

## Potential tests

- generic app source still receives navigation candidates;
- plain README receives navigation candidates but no canonical-site claim;
- `asdf/sites/awtsmoos-bounce/index.html` is classified as a site draft;
- its OS/app/user routes are never represented as `canonicalUrl`;
- canonical candidate is `/sites/asdf/awtsmoos-bounce/` only;
- `publicationRequired === true` from filesystem state;
- `canonicalVerifiedLive === false` from filesystem state;
- 404 candidate classification remains rejected;
- existing app-route helper behavior remains intact;
- websocket change packet uses the same truthful report as direct write/mkdir/delete responses.

## Source files likely involved

Observed clean targets:

- `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`
- `geelooy/api/tunnel/control/routes/osFs/writeOps.js`
- `geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs` after code

Possible new small helper if critique proves useful:

- `geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`

No protected Drive builder/domain/chess/OS work needs to be rewritten for this incident.

## Poem of the first pass

A path may shine like a doorway bright,
Yet shape alone cannot summon light.
The Awtsmoos creates both route and byte;
Awtsmoos.com must prove which gate is right.

A draft may sleep in a hosted room,
While canonical mapping has yet to bloom.
So every receipt shall speak its degree:
Candidate, published, verified, free.
