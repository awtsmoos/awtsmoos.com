# B"H
# Awtsmoos Tunnel Artifacts — Native Browser Capture and Stored Sharing

This document describes the implemented release 1.0.673 features and their
current limits. The browser and publisher are separate authorization boundaries.

## 1. Exact-target browser screenshot

Native tunnel action (browser-enabled device):

```json
{
  "action": "captureBrowserTarget",
  "targetId": "EXACT_CHROME_DEVTOOLS_TARGET_ID",
  "viewport": {"width": 390, "height": 844},
  "deviceScaleFactor": 3,
  "mobile": true,
  "cacheDisabled": true,
  "waitUntil": "none",
  "requestId": "capture-example-2026-10-16"
}
```

For 390 × 844 CSS pixels at DPR 3, Chrome produces 1170 × 2532
device pixels. The action uses **Page.captureScreenshot** on a separate,
explicitly identified CDP page socket; it does not capture the Mac foreground
window or attach to whichever tab happens to be active. An absent or ambiguous
target fails closed.

Its compact response contains: SHA-256, file path, bytes, MIME, timestamp,
target ID, URL, title, requested viewport, DPR, and transfer descriptor.
The raw image is stored in the connected agent's project-root
`.awtsmoos/chrome/artifacts/` directory, not pasted into tool output.

The default capture execution budget is 3900 ms (configurable to 4000 ms).
Each failure includes the stage and elapsed time. Request IDs are bound to
capture inputs; a repeated matching ID returns the completed on-disk receipt.
A completed artifact remains readable across an agent reconnect as long as
that machine's evidence directory remains intact.

`diagnostics:true` requests a limited stylesheet and computed-style summary;
it does **not** currently guarantee a complete network-error or console log.

## 2. Built-in image conversion

Native action:

```json
{
  "action": "transformImage",
  "file": ".awtsmoos/chrome/artifacts/EXACT_SHA.png",
  "width": 500,
  "height": 700,
  "quality": 75,
  "format": "webp",
  "stripMetadata": true,
  "requestId": "convert-sample-1"
}
```

This uses Chrome's built-in `createImageBitmap`, `OffscreenCanvas`, and
`convertToBlob` in an isolated page connection. Output supports PNG, JPEG,
and WebP. Canvas re-encoding strips EXIF and embedded image metadata.
No Python/Pillow, ImageMagick, FFmpeg, `sips`, or installed image package
is invoked. Input paths still use the existing secure project-root/secret
policy; browser control and filesystem read permission must both exist.

## 3. Controller-hosted temporary URL

The artifact-copy endpoint is:

```text
POST https://awtsmoos.com/api/tunnel/control/artifact/publish
```

Authenticated owner/admin JSON payload:

```json
{
  "routeReference": "YOUR_VERIFIED_AUTHORIZED_ROUTE",
  "path": ".awtsmoos/chrome/artifacts/EXACT_SHA.png",
  "ttlSeconds": 600,
  "allowDownload": true
}
```

Requires a verified session/API key with `tunnel.admin` scope. The controller
uses the existing identity-checked device file-transfer actions to retrieve
and SHA-256-verify the complete file, then stores its own private disk copy.
It returns a random-token URL under
`/api/tunnel/control/artifact/<token>/<filename>`.
The URL expires automatically, is not cacheable, and is downloadable without
a live Mac tunnel for its remaining TTL. Max upload: 16 MiB. Max TTL: 3600 s.

For one file inside a folder, use
`POST /api/tunnel/control/artifact/publish-folder-file` with
`root` and `relativePath` in place of `path`. Traversal is rejected.
It never publishes the entire directory.

To revoke early:

```text
POST https://awtsmoos.com/api/tunnel/control/artifact/revoke
Content-Type: application/json
Authorized owner's tunnel.admin session or API key

{"artifactId": "RANDOM_TOKEN_FROM_CREATE"}
```

Revocation invalidates the URL and removes stored bytes. Metadata is retained
only while active; expired records are cleaned in bounded maintenance sweeps.

## 4. Important current limitations

- **Cross-project, arbitrary desktop paths are still denied** unless the
  current device project-root authority permits them. A future path-specific
  owner approval contract is required before implementing universal
  `publishFile({path:"/Users/.../Desktop/..."})`. Do not widen fsRead
  or bypass secret-file protections merely to advertise that capability.
- The upload operation is an authenticated controller endpoint; it is not
  yet a single ChatGPT-side `pullArtifact` tool that installs bytes directly
  at `/mnt/data`. An AI that can download the token URL can write a real local
  file and verify its SHA. That is not equivalent to a fully integrated
  host-side ingestion action.
- Publication time includes server-to-device transfer and may exceed four
  seconds for large images. The four-second latency target is enforced for
  lightweight local target capture, not unlimited external network transfer.
- The server's durable artifact copy is stored in a private disk directory,
  controlled by `AWTSMOOS_ARTIFACT_STORAGE_ROOT` or a private home fallback.
  Operations that need cross-server durability must use shared encrypted
  storage; the current implementation assumes the configured production host.
- Browser inspection requires a Chrome DevTools connection already available;
  it never silently captures the wrong macOS foreground window.

## 5. Verification

Tests cover exact target IDs, 1170×2532 output, SHA-256, reusable receipts,
mismatched request IDs, latency failures, binary read-back, owner isolation,
path traversal, expired URLs, revocation, and native WebP conversion.
Live results should be recorded separately from unit or simulated tests.
