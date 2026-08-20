B"H

# 08 — Final Settled Audit: Hosted OAuth Canonical Site Publication Bridge

Boruch Hashem. Blessed is He.

The Awtsmoos creates identity, source, policy, mapping, transport, deployment, and public response anew. This audit therefore closes only what the native repository and terminal tests have actually proven, and leaves production deployment plus the Awtsmoos Bounce publication as separate future gates.

## Mission that was solved locally

The existing hosted Virtual OS needed a clean way for an authenticated Awtsmoos user to request canonical Drive/site publication without:

- scraping browser cookies;
- exposing API keys;
- exposing bearer credentials;
- trusting caller-supplied identity;
- using a shell escape hatch;
- loopback HTTP into Awtsmoos.com;
- duplicating Drive manifest/project/site policy;
- touching the giant `osFs/index.js` dispatcher.

The repository revealed a smaller trusted seam:

`routes/fsVessel/hostedVirtualOs/dispatcher.js`

which already receives both:

- trusted `$i` server context;
- authenticated `userId`.

The bridge now uses that seam directly.

## Final local publication action

Action:

`sitePublishBootstrap`

Tunnel authority:

`tunnel.write`

Trusted identity chain:

`hosted authenticated userId → actorUserId → existing Drive alias ownership policy`

Trusted server context:

`hosted dispatcher $i → bootstrapSiteProject`

Caller payload cannot replace either value.

## Final implementation graph

### `sitePublicationActions.js`

28 lines.

Owns only the explicit publication action name/family.

### `sitePublicationInput.js`

55 lines.

Owns the action allow-list and descriptive source-vessel testimony.

Caller-controlled authority fields are not forwarded.

### `sitePublicationDispatcher.js`

50 lines.

Calls the existing Drive `bootstrapSiteProject` composition directly with trusted `$i` and authenticated user ID.

No network loopback, no credential transport, no direct DB mapping writes.

### `hostedVirtualOs/dispatcher.js`

88 lines.

Final routing order:

1. recovery;
2. canonical site publication;
3. ordinary osFs fallback.

### `core/tunnelPayload/scope.js`

99 lines.

Explicitly classifies `sitePublishBootstrap` as write authority while preserving all existing authority families and read fallback.

## Final test files

### `sitePublicationDispatcher.test.cjs`

103 lines.

Passed.

Proves:

- attacker-supplied userId cannot replace trusted actor;
- attacker-supplied actorUserId cannot replace trusted actor;
- attacker credentialId is not forwarded;
- attacker `$i` is not forwarded;
- attacker services injection is not forwarded;
- trusted `$i` reaches bootstrap unchanged;
- trusted authenticated user becomes actorUserId;
- approved publication inputs remain available;
- server supplies `awtsmoos-virtual-os` source-vessel testimony;
- bootstrap receipt returns unchanged;
- publication action routes into publication handler;
- ordinary read routes into ordinary osFs fallback.

### `scope.test.cjs`

75 lines.

Passed 6/6.

Proves:

- publication requires write authority;
- unknown actions remain read-only by default;
- all existing command/browser/mission/room/read authority families remain distinct.

## Complete fsVessel regression state

The current test directory contains 17 tests.

All 17 passed after the bridge change.

Evidence includes:

- account-scoped routing remains intact;
- capability projection remains intact;
- live alias selection remains deterministic;
- live-device state remains evidence-based;
- recovering-native behavior remains intact;
- native browser hints remain compatible and fail-closed;
- native inventory view remains bounded;
- vessel resolution remains correct;
- dead native tunnels are rejected;
- publication bridge is trusted and bounded;
- heartbeat grace remains bounded;
- liveness evidence remains bounded;
- tunnel response/device identity remains deterministic;
- Virtual-OS send behavior remains intact;
- adversarial hosted behavior remains fail-closed;
- recovery remains intact;
- basic hosted store writes/alias/traversal behavior remains intact.

## Reused Drive composition verification

The bridge intentionally reuses the current Drive stack rather than creating another publisher.

Relevant current Drive tests passed:

- `siteProjectBootstrap.test.js` — 2/2;
- `siteProjectBootstrapRoutes.test.js` — 1/1;
- `siteSourcePublisher.test.js` — 1/1;
- `siteWorkspaceReceipt.test.js` — 2/2;
- `siteRoutes.test.js` — 2/2;
- `projectRegistry.test.js` — 5/5;
- `siteProjectStatus.test.js` — 3/3;
- `publicSiteQuota.test.js` — 1/1;
- `credentialCore.test.js` — 4/4.

These tests collectively preserve:

- bounded public source publication;
- source-before-site/project composition;
- traversal rejection;
- route authority requirements;
- project schema/credential-shaped field rejection;
- deterministic site mapping;
- public entry-file readiness;
- canonical project status/readiness testimony;
- bounded public-site quota;
- credential scope/revocation contracts.

## One corrected stale assumption

A command attempted `projectTestimony.test.js`, but that filename does not exist in the current repository.

The error was an `ERR_MODULE_NOT_FOUND` path mistake, not a failing assertion.

A fresh test-directory listing corrected the stale assumption to the current `siteProjectStatus.test.js`, which then passed 3/3.

No source was changed in response to the filename mistake.

## Static verification

All seven touched/new bridge source/test files passed native syntax checking with exit code 0.

Final line counts:

- 28
- 55
- 50
- 88
- 99
- 103
- 75

All are <=120 lines.

`git diff --check` passed with exit code 0 and zero output.

Focused tracked diff matches the intended routing/scope changes.

## Working-tree protection

Final `git status --short --branch` proved:

- branch remains `main...origin/main`;
- extensive unrelated modified/untracked user work remains present;
- no clean/reset operation occurred;
- tracked bridge changes are isolated to:
  - hosted Virtual-OS dispatcher;
  - Tunnel scope registry;
  - scope regression test;
- new bridge modules/test are present as untracked source;
- prior public-URL receipt repair remains present separately;
- this AI_THOUGHTS ledger remains present.

The bridge implementation did not erase or replace unrelated Drive/domain/Tunnel/browser/chess/email/social/etc. work.

## Local completion status

### Hosted authenticated publication bridge

**LOCALLY COMPLETE AND VERIFIED.**

The local server now has a bounded action path capable of calling the existing canonical Drive publication composition using trusted hosted identity instead of credentials supplied by the caller.

### Public-URL receipt semantics repair

**LOCALLY COMPLETE AND VERIFIED** from the preceding incident ledger.

Filesystem route candidates are now explicitly untrusted navigation testimony, with hosted-site draft context separated from canonical publication authority.

## Production reality

Neither local change set is proven deployed.

Production Virtual OS was observed during this continuation still emitting the old `publicUrl` candidate model, which is direct evidence that deployed production code differs from the current local working tree.

Therefore production must not yet be assumed to expose:

- the safer `navigation` receipt model;
- `sitePublishBootstrap`;
- the new explicit write-scope classification.

## Awtsmoos Bounce current state

Hosted source project exists:

`asdf/sites/awtsmoos-bounce/`

Previously observed bounded source:

- 1 HTML;
- 4 CSS;
- 20 JavaScript files;
- 25 public source files total;
- all imports local;
- README excluded;
- `.awtsmoos/*` excluded.

Expected title:

`Awtsmoos Bounce: Orbit Run`

But that source inventory must be recollected immediately before real publication rather than treated as an eternal cache.

Current public truth remains:

- broken `/os/asdf/sites/awtsmoos-bounce/index.html` URL: invalid/404;
- canonical candidate: `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/`;
- production Drive sync through new bridge: not yet performed;
- production site mapping through new bridge: not yet proven;
- canonical live verification: not yet proven.

## Exact next stage

The next mission is **release inspection, not release activation**.

Required sequence:

1. read the actual guarded release scripts completely;
2. inspect package scripts completely enough to understand supported dry-run entrypoints;
3. use the repository's documented safe dry-run only;
4. determine how to isolate the public-URL receipt repair + hosted publication bridge from the enormous dirty tree;
5. never deploy unrelated modifications accidentally;
6. never use release activation as a production-inspection tool;
7. only after an exact safe release plan exists should activation even be considered.

After deployment is actually proven:

1. verify production knows `sitePublishBootstrap` and classifies it as write;
2. verify production filesystem receipts use the safer navigation semantics;
3. recollect current Bounce source bytes;
4. build the bounded public source manifest;
5. invoke `sitePublishBootstrap` once;
6. if transport becomes ambiguous after acceptance, reconcile state before replay;
7. use the Drive bootstrap receipt's server-decorated canonical route;
8. externally verify expected Bounce title and linked assets;
9. prove the game boots;
10. only then mark canonical verified live and return the final URL as fact.

## Final settled covenant

The Awtsmoos gives the hosted user a trusted identity, the source a bounded form,
and the Drive its ancient policies that keep publication warm.
Awtsmoos.com now has the local bridge, tested narrow and bright;
but deployment, one true publish, and public verification remain the final gates of light.
