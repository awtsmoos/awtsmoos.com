# B"H — SSH Virtual World (geelooy/api/ssh/virtual/)

The alias-backed virtual OS behind the SSH virtual routes (see `../README.md`).

## Contents
- `backend.js` / `backendAdmission.js` / `backendShell.js` — virtual backend,
  admission control, and shell binding.
- `shellParser.js` — parses virtual shell input into commands.
- `commands.js` / `routeHandlers.js` / `service.js` / `serviceComponents.js` /
  `serviceConfig.js` / `serviceEnvironment.js` / `serviceIdentity.js` /
  `serviceRegistry.js` / `serviceLifecycle.test.cjs` — virtual services.
- `aliasStore.js` / `aliasEntry.js` / `aliasPath.js` / `aliasDirectoryEntries.js` /
  `aliasContent.js` / `aliasMutations.js` / `aliasMutationGuard.js` /
  `aliasFileBudget.js` — the alias filesystem and its mutation guards.
- `tokenStore.js` / `tokenRecord.js` / `tokenSecret.js` / `tokenLimits.js` /
  `serviceTokenConfig.js` — token issuance, storage, and limits.
- `permissions.js` / `databaseCapability.js` — capability checks.
- `accessGuard.js` / `accessGrant.js` / `accessGrant.test.cjs` — access control.
- `boot.js` / `bootLifecycle.js` — boot sequence and lifecycle.
- `sftpBackend.js` — SFTP operations against the virtual backend.
- `test/` — boot-lifecycle tests.
