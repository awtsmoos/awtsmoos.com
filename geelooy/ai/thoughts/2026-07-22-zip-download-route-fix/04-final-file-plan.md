<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final File Plan

## Root cause

The public anchor points at `/ai/relay/install/awtsmoos-server-extension.zip`, but the corresponding file is absent from `geelooy/ai/relay/install`. The dynamic server therefore falls through to its missing-route response. Git history confirms that this exact archive existed previously at that exact filesystem path.

## Files to create

- `geelooy/ai/js/chatgpt/transport/extensionPackage.js`: one canonical filename, public URL, source path, and artifact path.
- `geelooy/ai/scripts/buildServerExtensionZip.cjs`: rebuilds the complete archive from the current extension source and verifies its entry list.
- `geelooy/ai/tests/extensionZipPackage.test.cjs`: verifies the canonical URL, artifact existence, archive integrity, and exact source-to-ZIP closure.
- `geelooy/ai/relay/install/awtsmoos-server-extension.zip`: the complete generated binary served by `/ai/relay/install/...`.

## File to rewrite completely

- `geelooy/ai/js/chatgpt/transport/missingTransportNotice.js`: import the canonical package descriptor and use the absolute `/ai/...` URL rather than a route-relative guess.

## Verification

- Run the build script and `unzip -t`.
- Assert ZIP entries exactly equal current source files and begin at `manifest.json`/extension-relative paths, not an accidental parent folder.
- Run focused package tests and syntax checks.
- Serve `geelooy` locally, request the exact `/ai/relay/install/awtsmoos-server-extension.zip` URL, verify status/content type/body, and unzip the downloaded response.
- Exercise the rendered notice link in Chrome and verify its resolved URL.
