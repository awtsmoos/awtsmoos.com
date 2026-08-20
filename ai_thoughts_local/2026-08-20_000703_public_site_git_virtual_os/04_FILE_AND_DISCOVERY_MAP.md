B"H

# 04 — File and Discovery Map

Boruch Hashem. Blessed is He.

## Already touched in public-site work

- `geelooy/api/social/helper/drive/siteSourcePolicy.js`
- `geelooy/api/social/helper/drive/siteMappingPolicy.js`
- `geelooy/sites/directSitePathPolicy.js`
- `geelooy/sites/virtualOsSourceValue.js`
- `geelooy/sites/virtualOsSiteSource.js`
- `geelooy/sites/directSiteReadiness.js`
- `geelooy/sites/siteSourceResolution.js`
- `geelooy/sites/hostedFolderManifest.js`
- `geelooy/sites/siteFolderPublicationInput.js`
- `geelooy/sites/siteFolderPublication.js`
- hosted publication action/input modules
- `geelooy/api/tunnel/control/docs/sitePublicationCatalog.js`

These must be reread/tested before additional modification.

## Public-site files likely to modify after fresh read

- `geelooy/sites/siteGateway.js`
- `geelooy/sites/siteResolution.js`
- `geelooy/api/social/helper/drive/siteStatusService.js`
- hosted publication dispatcher
- Tunnel scope registry
- docs catalog/HTML/OpenAPI source
- Code/Drive publish UI modules discovered natively.

## Git discovery queries

Search native repo for:

- `git clone`
- `git push`
- `github`
- `repository`
- `remote`
- `credential`
- `token`
- password hashing primitives (`scrypt`, `argon`, `pbkdf`, `bcrypt`)
- HTTP Basic auth
- `git-http-backend`
- Code/Virtual OS repository UI
- project metadata repository fields.

## Expected new backend module families only if absent

`geelooy/api/social/helper/repositories/`

Potential small modules:

- `repositoryPolicy.js`
- `repositoryRepository.js`
- `repositoryService.js`
- `repositoryCredentialPolicy.js`
- `repositoryCredentialRepository.js`
- `repositoryCredentialService.js`
- `repositoryRemotePolicy.js`
- `gitProcess.js`
- `gitCloneService.js`
- `gitSyncService.js`
- `gitHistoryService.js`
- `gitSmartHttpGateway.js`
- `gitBasicAuth.js`

Exact paths/names follow existing architecture after inspection.

## Expected Tunnel modules only if current abstractions require them

- repository action names
- bounded repository input normalizer
- trusted repository dispatcher
- scope additions
- action catalog additions

## Expected UI discovery

Find current Code app source and current Virtual OS/Drive repository/project panels.

Likely modules to add:

- RepositorySummary
- RepositoryChanges
- RepositoryHistory
- RepositoryRemotes
- RepositoryCredentials
- RepositoryPublish
- CloneRepositoryDialog
- AIHistoryAssistant

Do not create these until current UI component conventions and API client are read.

## Tests to discover before implementation

- Tunnel scope/hosted VOS tests
- Drive/site gateway/mapping/status tests
- auth/credential tests
- route registration tests
- Code/Virtual OS UI tests
- browser smoke harness
- release deployment tests.

## GitHub/release inspection

Before any push:

- `git remote -v`
- current branch/base SHA
- `git status --short --branch`
- remote authentication availability
- protected branch rules if discoverable through existing Git tooling
- clean isolated release worktree strategy.

## Refrain

The Awtsmoos does not guess where a feature lives. Awtsmoos.com must follow the actual imports, routes, stores, tests, and UI trees until the complete dependency graph is seen; only then may a whole file be rewritten.
