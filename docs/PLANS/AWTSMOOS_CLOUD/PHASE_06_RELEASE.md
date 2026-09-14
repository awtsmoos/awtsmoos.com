<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase 06 — Validation, Integration, and Release

## Source-quality gate

Create an automated validator for the user's authored-source laws: blessing header, JavaScript below 120 lines, tab indentation, extensive documentation for modules/exports, readable multi-line statements, and detection of obvious compressed/minified source. Run it on the exact touched-file set and later in CI.

## Regression gate

Run focused tests while implementing, then the complete relevant suites together: Drive, Sites, domains/DNS/TLS, project runtimes, Tunnel, account graph, Geelooy OS, Wallet/commerce, Website Maker, SEO/catalog, and real-browser smoke tests.

## Integration gate

Because many agents edit concurrently, review targeted diffs immediately before staging. Never stage the whole dirty repository. Confirm no selected file contains unrelated changes, run `git diff --check`, syntax checks, source-law checks, and dependency/route parity.

## Staging gate

Create a release manifest with Git SHA, Drive schema revision, catalog revision, deployment schema/version, asset version, and enabled feature flags. Verify one-prompt preview/publish/rollback, custom domain, payment sandbox, account/Tunnel actions, and OS deployment controls on staging.

## Production gate

Production deploy occurs only after staging is green. After deploy, independently verify public URLs, APIs, immutable deployment serving, rollback, domain routing/TLS, Wallet/commerce health, and critical account actions. Record exact production SHA and observed evidence.

## Never claim

Do not claim a site/service is live because configuration was saved, a process started, or an API returned an acknowledgement. Distinguish configured, internally ready, externally verified, and production-observed states.

## Rollback rule

Every release must have an explicit rollback path before promotion. Deployment/schema changes must remain backward-readable where possible so rollback does not strand state created by the newer code.
