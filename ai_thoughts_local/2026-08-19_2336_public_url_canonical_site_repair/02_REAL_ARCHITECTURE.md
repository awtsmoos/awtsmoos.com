B"H

# 02 — Real Architecture: Storage Navigation Is Not Site Publication

Boruch Hashem. Blessed is He.

The Awtsmoos creates every instant anew; this architecture record therefore names only what was physically observed in the live native repository, the hosted Virtual OS, the production HTTP response, and the authenticated-browser probe.

## Observed repository root and protected state

Native repository root:

`/Users/awtsmoos/work/awtsmoos.com`

Fresh `git status --short --branch` proves `main...origin/main` with substantial protected modified/untracked work across Drive, domain, Tunnel runtime, chess, OS browser, styles, notifications, and builder files.

The focused URL-report files below were NOT listed as pre-existing dirty files:

- `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`
- `geelooy/api/tunnel/control/routes/osFs/writeOps.js`
- `geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs`

They are therefore isolated candidates for this repair. Existing Drive builder/domain work remains protected and must not be rewritten merely to fix this incident.

## Observed Virtual-OS write receipt architecture

`publicUrls.js` currently exports:

- `appRoute`
- `classifyCandidateResult`
- `publicOrigin`
- `publicUrlReport`
- `verificationPlan`

`publicUrlReport(payload, parsed)` currently:

1. resolves alias and inner path;
2. derives an optional app route;
3. always manufactures generic candidates under Awtsmoos.com:
   - `/geelooy/os/<alias>/<innerPath>`
   - `/apps/<alias>/<innerPath>`
   - `/u/<alias>/<innerPath>`
4. prepends an app-specific candidate when `apps` or `Coby` appears in the path;
5. attaches a verification plan which explicitly says candidates are untrusted.

The implementation has no special understanding of hosted website drafts under `<alias>/sites/<siteId>`.

## Observed write propagation

`writeOps.js` imports `publicUrlReport` and attaches its return value under the field name `publicUrl` in:

- websocket `AWTSMOOS_OS_CHANGED` packets;
- `writeFile` return values;
- `makeFolder` return values;
- `deletePath` return values;
- indirectly `writeIfHash` through `writeFile`.

Therefore a generic filesystem write receipt combines two facts of different strength:

- proven storage mutation;
- unverified navigational route guesses.

The strong field name `publicUrl` makes that second fact easy for an agent to overstate.

## Observed focused tests

`test/publicUrls.test.cjs` intentionally verifies:

- app-route extraction;
- generic OS/app candidates;
- `verification.required === true`;
- `DYN_ROUTE_NOT_FOUND` rejection;
- successful candidate classification after a 200/render signal;
- plain README navigation candidates.

It contains no website-draft classification test and no assertion that filesystem state cannot produce canonical-site truth.

## Observed canonical site architecture

Canonical publication is already implemented elsewhere and must remain the only authority for public site identity.

`POST /api/social/drive/:aliasId/actions/bootstrap-site-project`

Physically observed route requirements:

- `drive.write`
- `drive.public`

Physically observed request values:

- projectId
- siteId
- rootPath
- name
- title
- runtimePreference
- bindings
- providerIntents
- enabled
- primary
- subdomainRequested
- sourceVessel
- files

`siteProjectBootstrap.js` physically proves this sequence:

1. bounded source publication;
2. project-config persistence;
3. owned site mapping upsert;
4. Project Testimony generation;
5. workspace receipt generation.

`siteWorkspaceReceipt.js` physically proves:

- `canonicalPath` comes from `site.project.publication.route`;
- `canonicalUrl` is derived from that server-side publication route;
- `canonicalVerifiedLive` remains false until an external verification step occurs.

Therefore Virtual-OS filesystem code must never claim canonical publication authority.

## Observed source-publication policy

`siteSourceManifest.js` and `siteSourceContent.js` prove:

- maximum 64 files;
- maximum 2 MiB total;
- relative paths only;
- `.awtsmoos` and descendants forbidden;
- duplicate paths forbidden;
- exactly one of `content` or `contentBase64` per file.

The current Awtsmoos Bounce hosted source was individually read from actual Virtual-OS bytes:

- 1 HTML;
- 4 CSS;
- 20 JavaScript files;
- 25 public files total;
- every import remains local;
- private `.awtsmoos/*` metadata and README are excluded from publication.

## Observed authentication state

Drive frontend transport supports:

- current browser session;
- `x-awtsmoos-api-key` for user credentials;
- `Authorization: Bearer ...` for Drive credentials.

Credentials are transient in browser state and not stored persistently by `state.js`.

The current Chrome API tab physically returned:

`LOGIN_OR_CREDENTIAL_REQUIRED`

Therefore no authenticated canonical publish mutation has been attempted in this continuation. We will not scrape, print, or fabricate credentials.

## Correct responsibility split

### Virtual OS filesystem layer

May testify:

- storage path;
- alias/path decomposition;
- navigation candidates;
- whether a path structurally resembles a hosted website draft;
- the expected canonical site route candidate;
- that publication is required;
- that canonical live verification has not happened.

Must NOT testify:

- canonical site mapping exists;
- canonical URL is authoritative;
- website is live.

### Drive/site publication layer

May testify after successful mutation:

- canonical Drive root;
- project/site identity;
- server-decorated canonical route;
- publication readiness/testimony.

### External HTTP verification layer

May testify:

- route returns expected title/DOM/content;
- canonical URL is actually live.

## Compatibility design boundary

There may be unknown consumers of the existing `publicUrl` response field. The repo-wide grep performed so far was partial and cannot prove absence.

Therefore the initial source repair should avoid a reckless hard deletion of `publicUrl`.

A safer migration is:

1. introduce a truthful report shape whose primary semantics are navigation candidates;
2. add `trusted: false` / `kind: "navigation-candidates"`;
3. add website-draft testimony for site paths;
4. explicitly set canonical authority absent from filesystem state;
5. preserve `publicUrl` temporarily as a deprecated compatibility alias if necessary;
6. expose a clearer sibling field such as `routeCandidates` or `navigation` from `writeOps.js`;
7. add tests that prevent `/os/...` from ever appearing as a canonical URL.

## Candidate module split

`publicUrls.js` is currently about 70 lines. `writeOps.js` is about 80 lines. Both are below the 120-line limit today.

If website-draft classification would make `publicUrls.js` crowded, create one small helper:

`geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`

Responsibilities:

- detect `<alias>/sites/<siteId>`;
- validate/extract bounded site ID structurally;
- return hosted workspace root;
- return canonical route candidate only;
- state `publicationRequired: true`;
- state `canonicalVerifiedLive: false`;
- never return `canonicalUrl`.

Then `publicUrls.js` stays focused on generic navigational candidates.

## Files expected to touch after planning

Likely:

- `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`
- `geelooy/api/tunnel/control/routes/osFs/writeOps.js`
- optionally new `geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`

Tests after code:

- `geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs`
- optionally a new focused site-draft test if splitting keeps responsibilities clearer.

No current evidence justifies touching canonical Drive/site backend code for the URL-receipt bug itself.

## Architectural refrain

The Awtsmoos gives the byte its place,
The mapping gives the site its face.
Awtsmoos.com must keep the witnesses apart:
A route candidate is not a published heart.
