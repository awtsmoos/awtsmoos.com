B"H

# 07 — Second-Pass Verification: Public Website System

Boruch Hashem. Blessed is He.

The Awtsmoos creates the test and the tested deed anew. The public-site phase is now source-read, corrected, and regression-verified before Git repository implementation begins.

## Source corrections after first readback

The second source pass corrected two planned deltas and one compatibility edge discovered by legacy tests:

1. Drive directory indexes are served with legacy trailing-slash redirects for root and nested folders.
2. Snapshot publication defaults Drive copies to `sites/<siteId>` instead of mirroring arbitrary hosted source paths.
3. Explicit named and custom-domain-bound routes may testify `X-Awtsmoos-Site-Id`; primary alias routes continue hiding the site ID.

Concurrent blocked-route and site-ID privacy hardening in `siteGateway.js` was preserved throughout.

## Structural verification

All authored public-site/docs source files are <=120 lines after modular splitting.

Syntax checks passed.

Key modules loaded together successfully.

Every source file was reread before tests.

All five new test files were reread, syntax-checked, and remained <=120 lines.

## New regression tests — all green

- `directSitePolicy.test.js`
- `siteFolderPublication.test.js`
- `sitePublicationStatusV3.test.js`
- `sitePublicationActionsV2.test.cjs`
- `sitePublicationCatalog.test.cjs`

These prove:

- legacy mappings remain Drive snapshots;
- direct mappings explicitly use hosted Virtual OS;
- private metadata remains hidden;
- hosted binary bytes are preserved;
- direct mode avoids snapshot bootstrap;
- snapshot mode copies to canonical Drive root;
- canonical URL is returned from state testimony;
- explicit primary site canonical URL remains stable;
- source-unavailable status does not erase canonical identity;
- trusted identity cannot be spoofed through payload;
- folder publish/unpublish require write scope while status remains read scope;
- Human/API docs expose publication contracts, immutable OAuth routing, and no-install Virtual OS publication.

## Legacy compatibility tests — green

Targeted gateway/domain compatibility:

- `siteGateway.test.js`
- `siteGatewayNamed.test.js`
- `siteMappingGateway.test.js`
- `customDomainGateway.test.js`

Authoritative existing-suite run used only discovered real file paths and completed exit 0 with marker:

`PUBLIC_SITE_VERIFICATION_OK`

The run included credential, quota/accounting, site mapping/routes/bootstrap/bootstrap-routes/project/status/source/workspace receipt tests plus Tunnel scope, account relay, publication v2, and original publication dispatcher tests.

Earlier sweep failures caused by nonexistent filenames (`siteStatusService.test.js`, `siteSourceManifest.test.js`) were command-list mistakes, not product failures, and were replaced by filesystem-discovered test paths.

## Manual gateway behavior proof

A plain isolated Drive fixture additionally proved:

- `/sites/alpha` -> 308 `/sites/alpha/`
- `/sites/alpha/` -> 200 Home index
- `/sites/alpha/docs` -> 308 `/sites/alpha/docs/`
- `/sites/alpha/docs/` -> 200 Docs index

This separated actual product behavior from a temporary subprocess-output capture glitch during debugging.

## Current publication covenant

The intended user workflow is now represented in source and tests:

`owned hosted folder -> sitePublishFolder(direct|snapshot) -> publication.canonicalUrl -> sitePublicationStatus -> external expected-content verification`

Direct mode serves current hosted bytes without a publication copy.

Snapshot mode server-collects a bounded manifest and delegates to existing Drive bootstrap.

Raw `/geelooy/os/...` routes remain navigation/editor surfaces and are never canonical website authority.

## Not yet production-deployed

No production deployment or live Bounce publication has occurred in this phase.

The production raw `/os/...` URL remains known-bad until the tested code is released.

Production verification remains a later gate after Git/repository work is integrated, isolated in a clean release tree, committed, pushed, and deployed as an exact tested revision.

## Next phase

Repository/Git implementation now begins using already-discovered foundations:

- real Git 2.37.1;
- executable `git-http-backend`;
- existing Code GitHub UX;
- existing scrypt/timing-safe credential crypto patterns.

The Awtsmoos has made the public road truthful. The next work gives the same source a history and a Git doorway without confusing repository authority with website authority.
