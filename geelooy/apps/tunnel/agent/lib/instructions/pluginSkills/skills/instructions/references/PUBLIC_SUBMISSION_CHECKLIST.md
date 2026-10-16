<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Awtsmoos Shliach — public plugin submission gate

This is a **shipping checklist**, not a declaration of directory approval.
Do not submit a private GPT draft name as a backend plugin ID, invent a
review-status badge, or claim a public listing from a passing unit suite.

## Package and developer identity

- [ ] The canonical package `plugins/awtsmoos-shliach/` is validated,
  the root `plugin.json` and `.codex-plugin/plugin.json` versions match,
  every local skill/script/icon reference exists, and the archive has one root
  plugin without private runtime records.
- [ ] The package uses a unique version greater than the previous release,
  clear public capability descriptions, truthful no-installation-fee/external
  Peruta-credit disclosure, functioning icon, publisher name and support URL.
- [ ] Instructions link to the current dynamic action schemas, real OAuth
  connection, safe user-consent requirements and practical examples.
- [ ] The package embeds **no** bearer tokens, private API keys, pairing
  codes, machine identities, browser cookies, SSH secrets or local state.

## Public identity and service

- [ ] HTTPS terms, privacy, support and website URLs return the intended
  user-visible content (not merely a generic 200/SPA fallback).
- [ ] OAuth protected-resource metadata identifies the exact MCP audience.
  Missing bearer gets HTTP 401 and the correct `WWW-Authenticate` challenge.
- [ ] `tools/list` works with a **real reviewer OAuth token** and shows
  the currently deployed tool names and request schemas.
- [ ] `awtsmoos_bootstrap` and `awtsmoos_discover_device` return a real
  reviewer-owned route; missing/offline/revoked permissions fail honestly.
- [ ] Reviewer test data consists of an isolated, permissioned sample device,
  sample directory/README and plan namespace. Provide sign-in/test setup by
  the supported secure review channel; never embed reviewer credentials.

## Security and task execution

- [ ] Read file and directory tools enforce account/device/path boundaries.
- [ ] Arbitrary shell execution needs a separately granted command scope and
  device permission, not merely a plugin installation.
- [ ] Every public artifact requires explicit named-file consent and
  `tunnel.admin`. Validate its SHA-256, TTL and revoke; deny unowned paths
  and session-only disclosure without elevated authority.
- [ ] Capturing a screenshot uses the **exact target** and verified installed
  agent action; never assume an old agent exposes the new command.
- [ ] Public file links are bearer capabilities; preview localhost links
  are a separate authenticated family, not anonymous file hosting.
- [ ] An accepted mutation with an ambiguous response must be observed
  by its existing ID before retrying.
- [ ] Rotate inherited embedded control secrets through an explicitly
  coordinated client migration. Do not rotate without verifying all clients.

## Reproduction evidence

- [ ] Source-level tests pass for MCP auth, tool schemas, artifact binary
  transport, private preview, screenshot and publication/revocation.
- [ ] The fully deployed SHA matches GitHub and the public installer,
  with clean production checkout and active service/socket.
- [ ] The Mac candidate's verified current version, registration, source
  checksum and actual harmless command are recorded **after promotion**.
- [ ] A real outside-host reviewer test captures an authorized image,
  transfers the exact bytes, publishes a short-lived link, retrieves
  byte-identical content without Mac connectivity, and revokes it.
- [ ] At least one unauthorized-user and missing-scope test returns 401/403
  on the **public** routes. Unit mocks alone do not satisfy this gate.
- [ ] No important support, data-retention, Peruta, copyright or content
  claim conflicts with the published privacy/terms pages.
- [ ] All review-positive and review-negative prompts are evaluated on
  the actual connected plugin in a reviewer account, not only in mocks.

## Developer submission

The plugin package can be created/imported privately and tested before
review. **Public listing/approval is a separate developer/administrator
action**, subject to whatever submission controls the account actually
offers. Use the plugin detail page or the current approved developer
submission UI. No instruction or tunnel command can guarantee approval.

For package tests use the repository's publication-validator and
`node scripts/tunnel/syncPluginInstructionMirror.cjs`. For binary/link
contracts see `ARTIFACTS_AND_PUBLIC_LINKS.md` and the repository's
`geelooy/apps/tunnel/downloads/ARTIFACT_TRANSPORT.md`.

## Current known evidence — 2026-10-16

- Production before the pending feature release was on
  `8fce3b3f4ad4091507c4454db866bdfc7ac17f66`; the installed Mac was
  running `1.0.671` while the published installer advertised `1.0.673`.
- A safe live installer attempt correctly requested **fresh account pairing**.
  Candidate promotion is blocked until the owner approves it.
- Binary transfer, screenshot, artifact publication, and preview unit tests
  passed in isolation (34/34 on the audited matrix). New MCP artifact
  publish/revoke tests passed separately (10/10); do not label them
  deployed/authenticated until production is actually updated.
- Privacy, terms, support and OAuth metadata responded over public HTTPS.
- Public review submission, connected reviewer login and outside-network
  screenshot-to-published-URL proof are **not yet independently certified**.
  These are blockers, not cosmetic optional tests.
