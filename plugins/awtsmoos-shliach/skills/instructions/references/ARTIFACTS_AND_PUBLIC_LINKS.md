<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Binary screenshots, artifact transfer, and temporary public links

Use this when a user wants a **real image/file from an authorized device**, a
temporary URL, or a file actually attached to the current AI host. A screenshot
receipt is not an image attachment; a public URL is not proof that the host
downloaded the bytes. Every boundary needs independent evidence.

## Quick path: publish exactly one reviewed file

1. **Get consent for public exposure.** Name the file, audience
   ("anyone possessing the URL"), and expiration. This is an open-world
   mutation, not a harmless read. Never infer consent from routine screenshot
   inspection or a previous request for a different path.
2. With an authenticated MCP connection, call `awtsmoos_discover_device`;
   retain the exact returned `routeReference`. Use only the account-owned
   source path that the device is authorized to read.
3. Call `awtsmoos_artifact_publish` with:
   ```json
   {
     "routeReference": "EXACT_DISCOVERED_REFERENCE",
     "path": ".awtsmoos/chrome/artifacts/EXACT_SHA.png",
     "ttlSeconds": 600,
     "allowDownload": false,
     "confirmPublicSharing": true
   }
   ```
   The server requires `tunnel.admin`, verifies SHA-256 for each transferred
   chunk and the complete file, and privately stores its own 16 MiB maximum
   copy before returning `artifactId`, `url`, `sha256`, `bytes` and
   `expiresAt`. `confirmPublicSharing:true` must reflect the user's
   actual informed approval; never set it merely to satisfy a schema.
4. Fetch the returned HTTPS URL from the intended recipient/AI host. Check
   **HTTP 200, MIME, byte count, whole-file SHA-256**, and image dimensions or
   file format. Only after the receiving host actually writes the bytes may
   it create its own download attachment or image preview.
5. Revoke early with `awtsmoos_artifact_revoke`:
   ```json
   {"artifactId":"EXACT_ARTIFACT_ID_FROM_PUBLICATION"}
   ```
   Revocation requires the same owner and `tunnel.admin`. Expiration caps:
   30 to 3600 seconds. Token URLs are bearer capabilities: **any link holder
   can see the file until expiration or revocation**. Do not put them in
   analytics, public logs, indexed docs or source control.

For another supported client, the equivalent direct HTTPS endpoints are:
`POST /api/tunnel/control/artifact/publish`,
`POST /api/tunnel/control/artifact/revoke`, and
`GET /api/tunnel/control/artifact/<token>/<filename>`. Do not assume the
MCP tool exists on an older deployment; call `tools/list` or bootstrap.
The direct upload path requires the same permission and an authenticated
session or server-verified API key.

## First capture the exact intended Chrome target

- Call `chromeTargets` and choose the exact page by **target ID, URL and
  ownership**; if the target is ambiguous, stop. A public page is safest for
  reviewer screenshots. Do not capture someone's existing private tab.
- On a runtime that advertises `captureBrowserTarget`, request it through
  `awtsmoos_tunnel_action` with the immutable route and:
  ```json
  {
    "targetId":"EXACT_CHROME_TARGET_ID",
    "port":9337,
    "viewport":{"width":390,"height":844},
    "deviceScaleFactor":3,
    "mobile":true,
    "cacheDisabled":true,
    "waitUntil":"complete",
    "requestId":"UNIQUE_STABLE_CAPTURE_REQUEST_ID"
  }
  ```
  Use the returned CDP port; **9222 is only the fallback default**.
  Inspect `ok`, `stage`, `durationMs`, PNG path, SHA-256 and real
  pixel dimensions. At DPR 3, 390 × 844 CSS pixels normally yields
  1170 × 2532 device pixels, subject to Chrome capture proof.
- On older agents, use the discovered `chromeScreenshotTransfer` action
  (a different URL-based pipeline) if supported, or report the missing
  capability. **Do not** call a source-only action and claim it was executed.
- Follow the receipt's `transfer.path` and `transfer.sha256`. Read through
  `fileTransferSourceProof` and `fileTransferReadChunk`; decode base64
  to binary and validate offset, chunk SHA and final SHA.
  `screenshotTransfer.js` and `scripts/tunnel/pullArtifact.cjs` provide
  host-side implementations; their test success does not install them into
  every ChatGPT client.
- Keep capture and transfer timings separate from public publication.
  The 4-second lightweight capture target is **not** a guarantee for
  arbitrary browser navigation, multi-megabyte transfer or download.

## Which public-link family?

**Artifact link:** self-contained expiring public URL to one copied file,
downloadable without a Mac connection after successful publication.

**Private localhost preview:** `previewLinkCreate` produces a temporary
remote-routing ID plus a separate bearer token for one Mac localhost port.
The token is presented in Authorization/Cookie, **not placed in the URL**.
This is an authenticated preview, not an anonymous public-hosting promise.
Its relay path and current health must be independently tested.

**Public website:** a persistent published site uses its own website
publication action, ownership and deploy contract. An artifact link does not
deploy an entire directory, generate a permanent website, or grant arbitrary
filesystem read permission.

## Never claim these without live proof

- Any file anywhere on the host can be published: project-root and secret-file
  protections still apply, and cross-root explicit grants are not implemented.
- A PNG was displayed **in this conversation**: confirm the host actually
  downloaded and exposed it as an image, not a fictitious sandbox path.
- The Mac upgrade completed: check installed runtime, pairing, registered
  connection, exact action listing and successful capture/transfer.
- The URL is universally permanent: it expires/revokes and lives on the
  configured production controller, not globally replicated storage.
- Private content is safe for public sharing merely because the action
  supports it: publishing needs fresh path-specific informed consent.

## Review acceptance gate

For each release record **which** conditions were verified: local unit fixture,
live Mac action, exact Chrome target + PNG dimensions, source proof, remote
MCP OAuth `tools/list`, admin-scoped public publish, outside-network GET,
matching SHA-256, offline-Mac GET while TTL remains, revocation/expiry,
and unauthorized denial. Unsupported/missing permissions must be reported as
blocked, not passed. Record no credentials or private captured content.
