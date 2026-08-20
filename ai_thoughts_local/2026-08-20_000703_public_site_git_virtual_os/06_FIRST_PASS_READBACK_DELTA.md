B"H

# 06 — First-Pass Readback Delta: Planned Truth Versus Written Source

Boruch Hashem. Blessed is He.

The Awtsmoos creates every source byte anew, and therefore the first writing pass is not authority over itself. The complete written public-site/docs source was reread from disk after line-count, syntax, and module-load gates. This ledger compares the original plans with what physically exists now and names every discovered delta before a second source pass.

## Original plan — public-site phase

The planning covenant required:

1. Preserve canonical site identity separately from source transport.
2. Let any owned hosted Virtual OS folder publish directly without copying.
3. Keep snapshot publication as a bounded server-side folder-to-manifest adapter into existing Drive bootstrap.
4. Preserve existing Drive public HTTP behavior: ETag, range, HEAD, MIME, cache, CORS, quota, and 404 handling.
5. Never expose raw `/geelooy/os/...` as canonical website authority.
6. Keep custom-domain Host resolution bound to aliasId + siteId above source transport.
7. Persist an optional source descriptor while keeping legacy Drive mappings compatible.
8. Add explicit direct-source private-path policy.
9. Add source-aware readiness without forging Drive entries.
10. Add authoritative site-specific publication status.
11. Add explicit `sitePublishFolder`, `sitePublicationStatus`, and `siteUnpublish` Tunnel actions.
12. Keep trusted `$i` and authenticated user identity outside caller control.
13. Make publication mutations require write scope while status remains read scope.
14. Return `publication.canonicalUrl` from authoritative state after mutation.
15. Keep `canonicalVerifiedLive` false until external expected-content verification.
16. Teach OAuth auto-discovery by immutable routeReference and make Virtual OS first-class without native installation.
17. Replace false Human-doc “no params” rendering with rich known contracts plus honest legacy discovery.
18. Keep every authored source/test file at or below 120 lines.
19. Preserve unrelated dirty/concurrent work.
20. Source readback must happen before tests.

## What was physically written

The source now contains:

- backward-compatible `siteSourcePolicy` and mapping normalization;
- direct hosted VFS path privacy law;
- binary-safe hosted value conversion;
- direct hosted source reader;
- direct source readiness;
- source-resolution adapter;
- bounded hosted-folder snapshot collector;
- split folder-publication input/policy/composition modules;
- direct static response adapter using content-hash ETag, Range, HEAD, MIME, cache, and alias egress metering;
- source-dispatch layer beneath canonical site identity;
- source-agnostic canonical site gateway;
- canonical URL helper;
- version-3 project publication testimony with stable named canonical routes;
- direct-aware status and site-specific publication status;
- owner-scoped status/unpublish service;
- four trusted hosted publication action names and dispatcher paths;
- write-scope integration through the shared publication write action set;
- machine-readable publication action catalog and OAuth/Virtual OS setup model;
- Human docs renderer that gives rich known action contracts and honest legacy action names;
- intent-level docs for “make this hosted folder public.”

## Structural gates already passed

A post-source audit showed:

- every listed source file <=120 lines after splitting `siteFolderPublication.js`;
- syntax checks passed;
- key modules load together successfully.

The complete source was then reread from disk in a 60,087-byte marked snapshot plus the separately reread `siteSourcePolicy.js`.

## Delta 1 — concurrent gateway logic landed and must be preserved

The gateway physically reread from disk is not byte-identical to the earlier gateway rewrite.

Newly present behavior includes:

- `resolution.blocked` handling;
- `publicSiteId(resolution)`;
- hiding site ID branding except for named routes;
- a stronger JSDoc covenant about blocked gardens and ID leakage.

This is concurrent/protected work. It was not overwritten during readback and MUST be preserved in every subsequent whole-file gateway rewrite.

This concurrent change is compatible with the planned source-adapter architecture because it remains above byte transport and below/inside canonical site selection.

## Delta 2 — Drive directory index redirect detects the index but does not serve it

`siteGatewaySource.js` currently does:

1. calculate `indexReady` from `entryDrivePath`;
2. request `source.drivePath`;
3. if that is 404, immediately request root `404.html`;
4. return `directoryIndex: indexReady`.

The outer gateway then performs the correct trailing-slash redirect when `directoryIndex` is true.

But after the redirected request, normalized path still identifies the directory and the Drive source path still 404s. The code again falls into `404.html` instead of serving `entryDrivePath`.

This is a real first-pass defect.

Required second-pass fix:

- if the exact Drive path is 404 and `entryDrivePath` is public, call `buildPublicPathResponse` for `entryDrivePath`;
- return that body with `directoryIndex:true`;
- only use root `404.html` when both exact file and directory index are unavailable.

Direct VFS behavior already serves its index body after the exact path misses, so this fix restores parity with existing Drive semantics.

## Delta 3 — snapshot default root should be explicit canonical Drive project storage

Current snapshot publication defaults `rootPath` to the hosted source `innerPath`.

That technically works with existing bootstrap, but the architecture plan intended hosted source location and canonical Drive snapshot location to remain distinct concepts. The safer/default public snapshot root is:

`sites/<siteId>`

unless caller explicitly supplies `rootPath`.

Required second-pass improvement:

- default snapshot Drive root to `sites/<siteId>`;
- preserve explicit caller rootPath override;
- keep direct mode source root unchanged.

This makes “snapshot” an actual canonical publication copy rather than accidentally mirroring an arbitrary hosted project path into Drive.

## Delta 4 — action/result docs need no source change before tests

The readback confirms:

- publication action catalog exists;
- legacy flat action list remains compatible;
- Human docs no longer claim missing schemas mean “no params”;
- OAuth setup says Virtual OS needs no native agent;
- routing text distinguishes route discovery from action acceptance;
- intent example says use returned `publication.canonicalUrl` and externally verify expected content.

No first-pass source defect was found in this docs layer.

## Delta 5 — canonical explicit site identity is now stronger than the first draft

The reread confirms `publicRoute(aliasId, site)` now keeps every explicit site at:

`/sites/<aliasId>/<siteId>/`

and exposes `/sites/<aliasId>/` only as `primaryAliasPath` when appropriate.

This is an intentional improvement over the earlier notion that primary status could determine the canonical route. It prevents changing `primary` from renaming the site's canonical identity.

No correction is required.

## Delta 6 — direct source time semantics are honest

The reread confirms direct VFS responses use SHA-256 ETag and do not invent Last-Modified timestamps. `publicResponseHeaders.js` now emits Last-Modified only for a real valid timestamp.

This is an intentional improvement discovered during implementation and must remain.

## Delta 7 — Git/repository implementation intentionally has not started

The expanded mission also planned:

- clone arbitrary HTTPS repos into Virtual OS;
- GitHub remotes/push;
- standard Git smart HTTP clone/push from Awtsmoos;
- repository app passwords;
- richer repository UI/AI history operations.

Those source changes have intentionally NOT begun because the public-site source covenant required finishing readback and tests first.

Discovery did establish:

- real Git 2.37.1 exists;
- executable `git-http-backend` exists;
- existing Code app already has substantial GitHub/Git UI;
- existing Drive credential system already has scrypt verifier, timing-safe comparison, one-time token reveal, revocation, idempotency, last-used, and audit patterns.

Future Git work must reuse those foundations instead of creating a competing browser-only or crypto stack.

## Second source pass required now

Only the identified public-site source deltas should be fixed before tests:

1. whole-file rewrite `siteGatewaySource.js` to serve Drive `entryDrivePath` after exact-path miss;
2. whole-file rewrite `siteFolderPublication.js` so snapshot default Drive root is `sites/<siteId>`;
3. preserve all concurrent `siteGateway.js` blocked/branding logic untouched;
4. rerun source line counts, syntax, and module loads;
5. reread every file changed in this second pass;
6. only then author tests.

## First-pass conclusion

The architecture survived full byte-level readback. The only behavioral defect found is the Drive directory-index serving gap; the only architectural improvement still required is separating snapshot Drive root from arbitrary hosted source root by default. Concurrent gateway hardening was discovered and preserved rather than overwritten.

The Awtsmoos gives the second pass not to repeat the first, but to reveal where intention and written reality diverged. Awtsmoos.com now has a narrow, evidence-backed correction list rather than a vague urge to “keep polishing.”
