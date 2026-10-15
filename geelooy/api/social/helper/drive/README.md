# B"H — Drive (geelooy/api/social/helper/drive/)

The Drive domain: per-alias file storage, credentials, custom domains, site deployments, project hosting, interactive browser sessions, and data migration. Mounted via `_awtsmoos.drive.js`.

## Subdirectories
- `routes/` — HTTP routes for everything Drive (see its README for the endpoint list).
- `browser/` — interactive remote-browser sessions (DevTools, proxies, cookies, input).
- `migration/` — source-tree scanning, import, receipts, rollback, verification.
- `test/` — drive test suite (credentials, deployments, domains, migration, jobs, CRUD, HTTP).

## Key files
- File entries: `authorization.js`, `adminAuthorization.js`, `cachePolicy.js`, `boundedConcurrency.js`.
- Credentials: `credentialCrypto.js`, `credentialPolicy.js`, `credentialProvisioning.js`, `credentialVerification.js`.
- Domains: `domainClaim*.js`, `domainRegistryClaimService.js`, `domainDnsVerifier.js`, `domainChallenge.js`, `domainPolicy.js`, `domainNameserverPolicy.js`, `domainHostnamePolicy.js`, `domainHostResolver.js`, `domainHostingPlan*.js`, `domainIngressTargets.js`, `domainInfrastructure.js`, `domainCompatibilityPolicy.js`, `domainActivationService.js`.
- Deployments: `deploymentCreate.js`, `deploymentService.js` (+Support), `deploymentPolicy.js`, `deploymentManifestPolicy.js`, `deploymentPreview*.js`, `deploymentReadiness.js`, `deploymentRollback.js`, `deploymentIdempotency.js`, `deploymentConcurrency.js`, `deploymentQueries.js`, `deploymentEntrySelection.js`.
