B"H

# Real Architecture

## Core domain model

### Project

A project is the stable user-facing object. It owns:

- projectId
- owner alias
- display name and optional slug
- workspace backend descriptor
- current published site mapping(s)
- preview generations
- custom-domain claims
- repository descriptor
- provider connections referenced by opaque IDs
- activity/audit history

Filesystem paths are backend details and never appear as global identity.

### Workspace backend

Two initial implementations:

1. Native tunnel project workspace.
2. Awtsmoos Virtual OS project workspace.

Both implement the same bounded file contract: list/read/write/delete/mkdir/stat plus project collect. The API must enforce a project root before touching backend paths.

### Agent session capability

An authenticated Shliach session requests a project capability containing:

- projectId
- owner identity
- allowed verbs
- expiry
- optional branch/revision
- optional deployment scope

The capability is not a provider token and cannot reveal provider secrets.

### Preview and deployment

- Preview generation is immutable once issued.
- Preview URL is server-created from generation identity.
- Publish creates/updates a live deployment pointing at a chosen generation or revision.
- Live URL comes from deployment testimony: canonical `/sites/...`, custom domain, or server-issued hosted hostname.
- Deployment manifest records source revision/generation and content digest.

### Repository

Repository is provider-neutral:

- first-party Awtsmoos Repository backend
- native Git repository adapter
- GitHub adapter
- future GitLab/Bitbucket adapters

Common verbs:

- repository.inspect
- repository.status
- repository.history
- repository.diff
- repository.branch.list/create/delete
- repository.commit
- repository.remote.list/connect/disconnect
- repository.fetch
- repository.push
- repository.deployRevision

`commit` and `push` are separate capability-gated verbs.

### GitHub connection

Preferred connection order:

1. GitHub OAuth/GitHub App authorization scoped to selected repositories.
2. Fine-grained personal access token stored server-side when OAuth is unavailable.
3. SSH key credential stored encrypted/server-side for advanced users.

Browser UI and agents receive only a connection ID and safe metadata such as account/login, repository list, scopes, and expiry.

### Awtsmoos Repository

First-party repository service stores:

- immutable revisions/commits
- trees/blobs or equivalent content-addressed snapshots
- branches/tags
- commit metadata
- diffs
- repository visibility/access rules
- deployment links

Initial UI can work from the first-party revision API. Git Smart HTTP/SSH compatibility can be added later without changing project identity.

### DNS provider connection

Provider-neutral interface:

- provider.inspect
- zones.list
- records.list
- change.plan
- change.apply
- change.verify
- change.rollback

Supported provider adapters are explicit capabilities. Credentials are server-held. A change plan contains before/after records, affected hostnames, provider zone, validation warnings, and rollback material.

### Domain activation

Domain lifecycle remains separate:

1. claim hostname
2. verify ownership
3. resolve desired routing plan
4. optionally apply provider DNS changes through a connected provider
5. verify observed routing
6. activate site route
7. provision/verify TLS independently

### Handoff links

A handoff URL references a signed handoff record, not secrets. It can identify:

- projectId
- optional branch/revision
- optional preview generation
- requested capability template
- expiry

The receiving Shliach must still authenticate as an authorized user before capability issuance.

## Initial vertical slices

1. Discover existing repository/Git/GitHub/tunnel-control implementations.
2. Add project-facing Git inspection contract without mutation.
3. Add first-party repository status/history representation.
4. Add bounded commit action against an authorized project workspace.
5. Add remote connection metadata and safe push planning.
6. Add provider-neutral DNS connection model and dry-run change plans.
7. Add Virtual OS project handle/handoff representation.
8. Add Drive/Geelooy UI surfaces only after service contracts are tested.
