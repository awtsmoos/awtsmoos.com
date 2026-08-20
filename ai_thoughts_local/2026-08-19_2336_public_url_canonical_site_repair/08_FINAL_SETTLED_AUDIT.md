B"H

# 08 — Final Settled Audit: Public URL Receipt Repair

Boruch Hashem. Blessed is He.

The Awtsmoos creates every path, byte, site mapping, and HTTP response anew. This audit therefore separates two nodes that the original failure incorrectly collapsed into one:

1. **filesystem receipt semantics** — now repaired and verified;
2. **actual canonical publication of Awtsmoos Bounce** — still blocked by missing legitimate Drive mutation authority.

No confidence statement substitutes for those separate facts.

## Incident statement

The other agent returned this as a supposed public website URL:

`https://awtsmoos.com/os/asdf/sites/awtsmoos-bounce/index.html`

That route was externally observed returning HTTP 404.

The hosted project source itself physically exists under:

`asdf/sites/awtsmoos-bounce/`

Therefore the source was not lost. The failure was that a Virtual-OS storage/navigation candidate was promoted into a public-site claim without the canonical Drive/site publication transition.

## Root cause proven in native source

The native implementation in:

`geelooy/api/tunnel/control/routes/osFs/publicUrls.js`

previously manufactured generic OS/app/user route candidates for every hosted path and exposed them under the strong field name `publicUrl`.

The same report already carried a verification warning, but its field name and lack of website-draft semantics made it easy for an agent to overstate an unverified candidate.

`writeOps.js` propagated that object into:

- write results;
- mkdir results;
- delete results;
- guarded writes indirectly;
- `AWTSMOOS_OS_CHANGED` websocket packets.

The storage layer therefore mixed a proven mutation fact with unproven navigation guesses under one misleading public label.

## Settled source repair

The repair now establishes three distinct testimony layers.

### 1. Navigation testimony

Virtual-OS mutations expose a preferred `navigation` object with:

- `kind: "navigation-candidates"`;
- `trusted: false`;
- storage path testimony;
- alias/inner path testimony;
- optional app route;
- generic OS/app/user navigation candidates;
- explicit verification plan;
- optional hosted-site draft testimony.

Navigation candidates remain useful, but they are no longer semantically allowed to impersonate canonical site publication.

### 2. Deprecated compatibility testimony

The old `publicUrl` field remains temporarily for compatibility, but now contains the same untrusted navigation semantics and adds:

`deprecated: true`

This preserves existing consumers while making the migration direction explicit.

Pre-existing compatibility tests for direct writes, mkdir/delete, websocket packets, and hash-guarded writes all pass.

### 3. Hosted site-draft testimony

For a path such as:

`asdf/sites/awtsmoos-bounce/index.html`

the filesystem can now structurally report:

- site ID: `awtsmoos-bounce`;
- hosted workspace: `asdf/sites/awtsmoos-bounce`;
- source-relative path: `index.html`;
- canonical **candidate**: `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
- `publicationRequired: true`;
- `canonicalVerifiedLive: false`.

It does **not** emit an authoritative `canonicalUrl`.

Only the Drive/site publication layer may later provide canonical route authority.

## Final module graph

The repaired implementation is deliberately split into small responsibilities:

- `siteDraftRoutes.js` — 48 lines;
- `candidateVerification.js` — 91 lines;
- `navigationCandidates.js` — 99 lines;
- `publicUrls.js` — 84 lines;
- `writeReceipts.js` — 83 lines;
- `writeAccess.js` — 53 lines;
- `writeHashGuard.js` — 61 lines;
- `writeOps.js` — 113 lines.

Every touched/new source module is <=120 lines.

Authored focused tests are also <=120 lines:

- `publicUrls.test.cjs` — 86 lines;
- `siteDraftRoutes.test.cjs` — 78 lines;
- `writeReceipts.test.cjs` — 55 lines.

## Full local `osFs/test` completion evidence

A fresh directory listing proved there are exactly nine tests in the local `osFs/test` folder.

All nine passed after the repair:

1. `pathJail.test.cjs` — PASS;
2. `publicUrls.test.cjs` — PASS;
3. `siteDraftRoutes.test.cjs` — PASS;
4. `virtualActionBridge.test.cjs` — PASS;
5. `virtualAiAgents.test.cjs` — PASS;
6. `virtualWebsiteMissionRejection.test.cjs` — PASS, 2/2;
7. `writeIfHashPublicUrls.test.cjs` — PASS;
8. `writeOpsPublicUrls.test.cjs` — PASS;
9. `writeReceipts.test.cjs` — PASS.

This test universe covers:

- the exact broken hosted-site path class;
- generic navigation behavior;
- deprecated compatibility shape;
- direct write/mkdir/delete behavior;
- websocket receipt behavior;
- guarded-write hashing behavior;
- path confinement;
- hosted action bridge behavior;
- AI-agent bridge behavior;
- unsafe website-mission rejection.

## Syntax and formatting evidence

Every touched/new source module and every authored focused test passed the native Node syntax checker individually with exit code 0.

`git diff --check` passed with:

- exit code 0;
- zero stdout bytes;
- no whitespace/conflict-marker findings.

The focused tracked diff was physically captured for `publicUrls.js` and `writeOps.js` and matched the intended semantic repair.

## Protected working-tree evidence

Fresh `git status --short --branch` completed with exit code 0.

It proves:

- branch remains `main...origin/main`;
- substantial unrelated modified/untracked user work remains present;
- this repair did not clean/reset the working tree;
- focused tracked repair files are modified;
- focused helper/test modules are present as new untracked files;
- this timestamped native AI_THOUGHTS ledger is present.

The unrelated Drive/domain/chess/OS/Tunnel/UI work remains protected rather than being overwritten in pursuit of this URL fix.

## Compatibility search caveat

A perfect whole-repository textual census of `publicUrl` consumers was not obtained because two broad read-only grep attempts became stuck in the unstable native execution lanes and were cancelled deliberately.

This is not hidden.

What is stronger than a speculative census is positively proven:

- the complete local osFs test universe passes 9/9;
- the pre-existing tests specifically consuming legacy `publicUrl` semantics pass;
- write/mkdir/delete/websocket compatibility passes;
- guarded-write compatibility passes;
- path jail remains green;
- Virtual-OS/AI bridge regressions remain green.

## Canonical publication architecture remains intact

The correct canonical transition remains:

`POST /api/social/drive/:aliasId/actions/bootstrap-site-project`

Observed required scopes:

- `drive.write`;
- `drive.public`.

Observed composition:

1. bounded source publication;
2. project config reconciliation;
3. owned site mapping;
4. Project Testimony;
5. workspace receipt.

The server receipt owns canonical route authority.

Filesystem navigation code does not call or replace this publication service.

## Awtsmoos Bounce source readiness

The current hosted Bounce project was read file-by-file from real hosted bytes.

Its public publication manifest is known and bounded:

- 1 HTML;
- 4 CSS;
- 20 JavaScript files;
- 25 public files total;
- all imports local;
- `.awtsmoos/*` excluded;
- README excluded;
- comfortably below the 64-file / 2 MiB publication ceiling.

Expected page title:

`Awtsmoos Bounce: Orbit Run`

The source itself is ready for canonical publication.

## Remaining blocked node: actual Bounce publication

The current browser/API probe returned:

`LOGIN_OR_CREDENTIAL_REQUIRED`

Therefore this continuation intentionally did NOT:

- scrape an API key;
- scrape a bearer token;
- print or extract cookies;
- fabricate Drive authority;
- call `bootstrap-site-project` without permission;
- claim a canonical site mapping exists;
- claim the canonical candidate is live.

Current honest state:

- hosted source: **ready**;
- public Drive sync: **not yet proven**;
- canonical mapping: **not yet proven**;
- canonical candidate: `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
- canonical URL: **not yet authoritative**;
- canonical verified live: **false / not yet proven**.

## Exact continuation when legitimate Drive authority exists

1. Use the already-known exact 25-file manifest.
2. Exclude `.awtsmoos/*` and README.
3. Call `bootstrap-site-project` once with legitimate `drive.write + drive.public` authority.
4. If request acceptance becomes ambiguous, reconcile status before any replay.
5. Read the server-decorated canonical path/URL from the receipt.
6. Externally fetch that URL.
7. Verify the expected title `Awtsmoos Bounce: Orbit Run` and functioning linked assets.
8. Only then set hosted metadata to `canonicalVerifiedLive: true` and return the live URL as fact.

## Tunnel condition

The native tunnel remains intermittently unstable because stale mailbox receipts persist, although execution repeatedly returns healthy after reconnection.

This audit relies only on terminal jobs, direct readbacks, concrete exit codes, and captured outputs—not on mere accepted receipts.

## Completion statement

### Systemic filesystem/public-URL receipt bug

**COMPLETE AND VERIFIED for the local `osFs` subsystem.**

The broken class of behavior—turning a Virtual-OS path/navigation candidate into canonical website authority—is now explicitly prevented by source semantics and regression tests.

### Actual Awtsmoos Bounce canonical publication

**NOT COMPLETE. BLOCKED BY LEGITIMATE DRIVE AUTHORITY.**

This remaining node is not a source-generation problem and not a route-formatting problem. The exact source and publication API are known; the missing prerequisite is authenticated mutation authority.

The Awtsmoos gives the draft its room and the published site its gate,
And Awtsmoos.com now refuses to confuse a candidate with fate.
The source is ready, the mapping must still testify in light;
Only then may the living canonical URL be named aright.
