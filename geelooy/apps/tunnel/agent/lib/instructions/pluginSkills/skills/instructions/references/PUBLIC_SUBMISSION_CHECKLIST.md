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

## Release verification snapshot — 2026-10-18

- Package 0.93.0 uses exactly five positive and three negative MCP review
  cases and keeps the authenticated universal MCP endpoint.
- A broad source suite passed 54/54 for artifacts, MCP, protected lanes,
  screenshot transfers and queues. One installer batch passed 18/20;
  two outdated installer test expectations were identified and are being
  reconciled. Do not claim a complete clean install pass.
- A live 281,151-byte screenshot-derived JPEG was downloaded over HTTPS
  to a separate receiver, preserved its SHA-256 and was inaccessible
  (HTTP 404) after owner revocation.
- The Mac native tunnel was running 1.0.681, not the latest source.
  Production HEAD was older than this release and the production checkout
  had numerous other agents' pending work. Do not overwrite or discard it.
- The public MCP endpoint rejects unauthenticated tools/list with HTTP 401.
  Support, terms, privacy and installer endpoints returned HTTP 200.
- Full, authenticated reviewer OAuth, new server HEAD activation and
  direct ChatGPT-managed attachment import are NOT independently verified.

## How to submit

1. Verify individual or business publishing identity in OpenAI Platform.
   Ensure permissions api.apps.write and api.apps.read.
2. Visit https://platform.openai.com/plugins and select Upload new or
   existing plugin. Select verified identity and upload the complete
   awtsmoos-shliach-0.93.0.zip. Keep all secrets outside the ZIP.
3. Resolve Metadata & Skills automated findings. In MCPs, connect
   https://awtsmoos.com/api/tunnel/control/mcp; complete domain and
   OAuth setup, then Scan Tools. Inspect tool schemas and security hints.
4. Enter reviewer login/fixtures ONLY through the secure dashboard form.
   Test all exactly five positive and three negative cases with a real
   connected account and owned authorized device.
5. Submit for review, then after approval choose Publish plugin. No
   tunnel command can guarantee approval.
6. Hosted MCP changes may undergo periodic post-publication scanning and
   eligible updates can become available after automated checks; they are
   NOT instantaneous unrestricted tool injection. The stable generic
   awtsmoos_tunnel_action tool can dispatch new authorized registered
   actions without changing its existing JSON schema, but all operations
   still require server-side scope, ownership and permission enforcement.
7. Bundled skill, metadata, icon or package updates require a new ZIP
   version and the portal package update flow.

Official current docs:
https://developers.openai.com/plugins/deploy/submission
https://developers.openai.com/plugins/deploy/app-review

## Any file as an artifact

The current artifact publication backend can preserve any one owner-approved
authorized file up to 128 MiB, not only screenshots. Examples include
PNG/JPEG, PDF, ZIP, audio, video, GLB and arbitrary binary data. Unknown
extensions are served as application/octet-stream. Publication requires
exact-file informed consent and tunnel.admin; it returns a temporary,
revocable bearer URL, an MCP resource_link, exact bytes, MIME and SHA-256.
HTTP GET sends real binary, with HEAD/range support in the new release.
But the Mac-to-relay hop still uses bounded Base64 chunks internally, and
a resource_link by itself is NOT a ChatGPT-managed file/attachment. The
receiving AI host must actually save and verify the bytes in its own
storage before presenting a sandbox link.

Merkava software captures and actual Chrome browser screenshots must never
be mislabeled as equivalent. For JavaScript/layout-sensitive pages use
the browser renderer, then verify the selected target, screenshot magic,
pixel dimensions, transfer digest, final bytes and actual viewed result.

CLI fast path should leave a healthy same-release guardian undisturbed.
Full installation must retain device identity unless the owner separately
requests a reset; cold clean-install, upgrade, rollback, offline repair and
independent multi-lane latency all require explicit real-environment checks.
