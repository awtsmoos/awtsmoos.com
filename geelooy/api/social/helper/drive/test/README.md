# B"H — Drive Tests (geelooy/api/social/helper/drive/test/)

The Drive test suite: credentials, deployments, domains, jobs, CRUD, HTTP, and the migration sub-suite.

- Credential core/routes; deployment concurrency, idempotency, policy, preview, publish/rollback race, route registration, service.
- Domain challenge/claims/policy/routes/verification/host-resolver/hosting-plan/ingress/routing (`domainTestHarness.js`).
- `driveCrud.test.js`, `driveHttp.test.js`, `pathAndRouter.test.js`.
- `jobRoutes.test.js`, `managerRoutes.test.js`, `managerClientContract.test.js`, `nativeAliasGateway.test.js`.
- Project: attachment evidence, automation policy, database batch/capabilities/documents/query/service, DNS policy, domain evidence.
- `migration/` — migration accounting, importer, manifest, rate controller/recovery, receipt repository, rollback, hasher, path policy, tree scanner (`testHelpers.js`).
