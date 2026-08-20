B"H

# 01 — Boundless Vision: Public Sites, Git, Virtual OS, and AI History as One System

Boruch Hashem. Blessed is He.

The Awtsmoos creates code, history, identity, public routes, credentials, and collaboration anew. Awtsmoos.com should make the simplest user intent — “make this a public website” or “clone this repo” — become one obvious action rather than a ritual of storage copying, URL guessing, credential juggling, and hidden deployment state.

## Product truth

The user should be able to say:

- “Make this folder a public website.”
- “Clone this GitHub repo into my Virtual OS.”
- “Push this Virtual OS repo to GitHub.”
- “Give me a URL I can `git clone` from any Git client.”
- “Create an app password for this repo, read-only.”
- “Show me what changed yesterday and let AI revert only the broken part.”

The system should resolve each into authoritative actions, receipts, history, and UI.

## Public website system

Any owned hosted folder may publish with:

- Direct mode — zero copy, current hosted bytes are live.
- Snapshot mode — bounded server-side copy through existing Drive bootstrap.

The site identity owns the canonical URL. Raw `/geelooy/os/...` paths never become website authority.

The one-click UI should expose:

- Publish / Unpublish.
- Canonical URL.
- Direct vs Snapshot.
- Source readiness.
- Verified-live state.
- Custom-domain state.
- Last publish/change testimony.

## Git import/export

Virtual OS should understand repositories as first-class objects:

- Clone public HTTPS Git repos.
- Clone authenticated HTTPS Git repos with user-supplied transient credential.
- Import GitHub repositories through connected GitHub OAuth/app authorization where available.
- Push a Virtual OS repo to GitHub.
- Add/edit/remove remotes.
- Fetch/pull/push.
- Branch/tag/commit/log/status/diff.
- Preserve `.git` semantics without exposing it through public website serving.

## Virtual OS as a Git remote

Every opted-in Virtual OS repository should have a clone URL, conceptually:

`https://awtsmoos.com/git/<aliasId>/<repoId>.git`

It should support standard Git smart HTTP so ordinary clients can run:

`git clone https://awtsmoos.com/git/asdf/orbit-run.git`

and, when write permission exists:

`git push origin main`

The URL identifies a repository mapping, never a raw filesystem path.

## App passwords / repository credentials

Create an Awtsmoos repository credential model analogous to GitHub fine-grained tokens, but clearer:

- User chooses credential name.
- Credential is shown exactly once.
- Server stores only a strong verifier/hash, never plaintext.
- Credential can be scoped to one repo, several repos, or all repos owned by one alias.
- Permissions are explicit: read, write, force-push, tag, admin.
- Optional branch restrictions.
- Optional expiration.
- Immediate revocation.
- Last-used testimony without logging the secret.
- Rotation creates a new secret and invalidates old one atomically.

Git Basic Auth compatibility:

- username may be alias or a fixed sentinel such as `awtsmoos`;
- password is the generated app password;
- authorization is derived from the hashed credential record, not username trust.

## Git storage model

The public Git remote should not fake Git over arbitrary VFS JSON requests.

Use a real repository representation with Git object/ref semantics.

Possible implementations to inspect:

1. Server-side bare repositories materialized from Virtual OS repo state.
2. A repository service using native Git plumbing against ephemeral/materialized worktrees.
3. A Git smart-HTTP adapter capable of translating VFS-backed repo state into standard Git protocol.

Preferred initial implementation after inspection: materialize/maintain canonical bare Git repos server-side and synchronize checked-out Virtual OS trees through explicit repository actions, because Git clients expect atomic refs, packfiles, object negotiation, and protocol invariants that should not be reimplemented casually.

## Virtual OS working tree model

A Virtual OS project may have repository metadata outside the public source tree:

- repo identity;
- default branch;
- remote catalog;
- current branch/HEAD;
- synchronization status;
- canonical Git clone URL;
- credential policy;
- history testimony.

The editor sees the checked-out tree; Git internals remain private.

## Clone any repo into Virtual OS

Action concept:

`gitCloneToVirtualOs`

Input:

- sourceUrl;
- targetPath;
- branch/ref optional;
- credential reference optional;
- shallow/depth optional.

Server validates target ownership and URL policy, clones in an isolated temporary vessel, then imports the complete checked-out tree and repository metadata atomically.

Never shell-concatenate untrusted URLs/paths.

## Push to GitHub

Action concept:

`gitPushRemote`

For GitHub:

- prefer OAuth/App credential stored by credential service;
- allow explicit user-created remote credential references;
- never log tokens;
- never embed tokens in stored remote URL;
- emit bounded push receipt: remote, branch, old/new SHA, status.

## AI history manipulation

AI should operate through ordinary Git operations with testimony, not hidden destructive rewrites.

Actions/UI:

- Explain commit.
- Explain diff.
- Find regression range.
- Suggest revert.
- Revert commit.
- Restore file from commit.
- Create branch from historical commit.
- Cherry-pick selected change.
- Interactive conflict-resolution assistance.
- Commit AI-authored changes with explicit message and user-visible diff.
- History graph with AI summaries.

Force-push/history rewrite is high authority and should require explicit permission + UI confirmation.

## UI/UX

Create one Repository panel inside the Virtual OS / Code experience:

Overview:
- repo name;
- branch;
- clean/dirty;
- ahead/behind;
- public website state;
- Git clone URL.

Changes:
- staged/unstaged files;
- diffs;
- commit message;
- commit button;
- AI “summarize changes” and “suggest commit message.”

History:
- graph/timeline;
- commits;
- branches/tags;
- AI explanation;
- revert/cherry-pick/branch actions.

Remotes:
- GitHub and arbitrary HTTPS remotes;
- fetch/pull/push;
- credential selector;
- connection/status.

Publish:
- Live Folder (no copy);
- Snapshot Copy;
- canonical URL;
- verify-live;
- custom domain.

Credentials:
- create/revoke/rotate app password;
- repository/permission/expiration scope;
- last used.

## Better Tunnel instructions

Agent instructions should be intent-first:

If user asks “make this a public website”:
1. detect current hosted folder;
2. call `sitePublishFolder(mode=direct)` by default;
3. use returned canonical URL;
4. verify expected content;
5. report it.

If local/native folder is requested:
- use native Tunnel or intentionally import/sync to hosted Virtual OS first;
- do not pretend a native filesystem path is server-hosted.

If user asks “clone repo into Virtual OS”:
- call repository import action;
- do not manually recreate files from browser snippets.

If user asks “push to GitHub”:
- inspect repo status/remotes;
- use connected credential;
- push exact branch/SHA;
- report remote receipt.

## Final vision refrain

The Awtsmoos should let one sentence become one lawful deed: source enters a vessel, history receives a name, publication receives a canonical gate, and every credential remains bounded. Awtsmoos.com becomes not merely a filesystem in a browser, but a living forge where websites, repositories, history, remotes, and AI testimony all agree on what is real.
