B"H

# 02 — Realistic Architecture: Reuse Git, Do Not Reimplement Git

Boruch Hashem. Blessed is He.

The Awtsmoos creates every Git object and every public byte, yet engineering must honor the protocols already proven by decades of clients. Awtsmoos.com should reuse Git plumbing and smart HTTP rather than invent an incompatible imitation.

## Existing work to preserve

The current direct-site pass already added/planned:

- backward-compatible site source descriptor;
- direct hosted-source path privacy policy;
- hosted source value normalization;
- direct hosted source reader;
- direct readiness;
- source resolution adapter;
- server-side hosted-folder snapshot collector;
- unified direct/snapshot folder publication service;
- Tunnel publication action names and bounded input extensions;
- additive site-publication docs catalog.

This new mission extends those foundations rather than restarting them.

## Required native discovery before Git code

Search/read completely:

- existing Git/repository modules under `geelooy/`;
- existing repository metadata in `_agent` and builder UI;
- any current GitHub OAuth/provider integration;
- credentials/token hashing/encryption services;
- HTTP auth middleware;
- route registration conventions;
- Virtual OS repository import/export helpers;
- code editor project/repository UI modules;
- existing Git command wrappers/process isolation;
- release/deploy tooling and Git remote configuration.

## Git service layers

### Repository identity

Create stable repo mapping:

- repoId;
- aliasId;
- hosted working-tree path;
- canonical bare-repo path/reference;
- default branch;
- visibility;
- created/updated timestamps.

Repo identity must not equal arbitrary VFS path.

### Working tree adapter

Responsibilities:

- materialize/read/write checked-out repository into hosted VFS;
- sync Git commit result back into VFS tree;
- never expose `.git` through direct-site public serving;
- keep repository metadata server-side/private.

### Git engine

Use actual `git` executable in isolated server-side working directories when available.

Never concatenate untrusted user input into shell strings.

Use spawn/execFile argument arrays.

Bound:
- execution time;
- object/pack bytes;
- clone depth if requested;
- allowed protocols (`https` initially; `ssh` only after explicit credential architecture);
- redirect count/target policy.

### Smart HTTP remote

Implement standard endpoints:

- `GET /git/:aliasId/:repoId.git/info/refs?service=git-upload-pack`
- `POST /git/:aliasId/:repoId.git/git-upload-pack`
- `GET /git/:aliasId/:repoId.git/info/refs?service=git-receive-pack`
- `POST /git/:aliasId/:repoId.git/git-receive-pack`

Delegate protocol work to `git-http-backend` or equivalent real Git backend.

Authentication:
- anonymous only for explicitly public read repositories;
- app-password Basic Auth for private read / any push;
- authorization resolves repo mapping + credential scope before backend is invoked.

### App-password service

Use cryptographically random secrets.

Persist:
- credentialId;
- ownerUserId;
- displayName;
- verifier/hash;
- scopes;
- repository selectors;
- expiration;
- createdAt;
- lastUsedAt;
- revokedAt;
- secret version.

Return plaintext only at creation/rotation.

Prefer Argon2id or scrypt/PBKDF2 according to installed dependency/runtime; inspect existing password policy before selecting.

### GitHub remote integration

Prefer existing provider credential infrastructure if present.

Store credential references separately from remote URLs.

Remote record:
- name;
- fetchUrl;
- pushUrl if distinct;
- credentialId;
- provider kind;
- last fetch/push testimony.

## Repository actions

Read actions:

- `gitRepoStatus`
- `gitRepoLog`
- `gitRepoDiff`
- `gitRepoBranches`
- `gitRepoRemotes`
- `gitRepoRemoteStatus`

Write actions:

- `gitCloneToVirtualOs`
- `gitRepoInit`
- `gitRepoCommit`
- `gitRepoCheckout`
- `gitRepoBranchCreate`
- `gitRepoMerge`
- `gitRepoRevert`
- `gitRepoCherryPick`
- `gitRepoRemoteSet`
- `gitRepoFetch`
- `gitRepoPull`
- `gitRepoPush`

Credential actions:

- create/list/rotate/revoke repository app password.

Force operations require stronger permission/explicit flag and dedicated docs warnings.

## UI architecture

Use existing Code/Virtual OS project shell and add modular tabs/panels rather than a separate monolithic Git app.

Small UI modules:

- repository summary card;
- branch switcher;
- changes list;
- diff viewer;
- commit composer;
- history graph/list;
- remote manager;
- credential manager;
- publish card;
- clone/import dialog;
- AI history assistant.

Every panel consumes the same backend actions the Tunnel exposes.

## Intent-level agent workflow

Expose high-level actions so the agent does not need to assemble low-level Git commands.

“Make this public” → `sitePublishFolder`.

“Clone this repo” → `gitCloneToVirtualOs`.

“Push to GitHub” → `gitRepoPush` after status/remote resolution.

“Undo the commit that broke X” → read log/diff → AI identifies candidate → `gitRepoRevert` after explicit target selection derived from evidence.

## Release strategy

Because primary tree contains protected unrelated changes:

- develop whole-file changes in primary only after fresh reads/status;
- test locally;
- construct clean worktree from current base;
- reconstruct intended complete files only;
- rerun tests;
- commit isolated release;
- push to GitHub only after remote/credentials are confirmed;
- deploy from exact tested commit using current guarded deployment mechanism.

## Refrain

The Awtsmoos gives Git its history and the site its public gate, but Awtsmoos.com must never confuse a working tree with a bare repository or a URL with an authority grant. Reuse the real Git covenant; bind it to the Virtual OS with explicit identity, credential, and synchronization law.
