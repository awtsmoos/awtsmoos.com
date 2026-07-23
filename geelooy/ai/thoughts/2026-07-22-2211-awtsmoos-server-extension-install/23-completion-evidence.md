<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Completion Evidence

## Public behavior

- Exact URL: `https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip`
- HTTP status: `200 OK`
- Content type: `application/octet-stream`
- Content length: `23755`
- Downloaded file type: ZIP archive
- Public and local bytes: exact match
- SHA-256: `a2cef22d23d8c8d9e09433da6337d50759209dea70c27966badcd272cdf0fca2`
- Archive integrity: all 15 entries passed `unzip -t`
- Archive root: directly contains `manifest.json`

## Source and regression evidence

- Canonical source: `geelooy/scripts/tricks/extensions/server`
- Builder: `geelooy/ai/scripts/buildServerExtensionZip.cjs`
- Regression suite: `geelooy/ai/tests/extensionZipPackage.test.cjs`
- Focused test result: four passed, zero failed
- Local HTTP response: exact artifact bytes
- Production worktree blobs: all six match commit blobs

## Publication evidence

- Branch: `main`
- Commit: `2b94610f98594b9fd35a68d896c582999c8520b9`
- Commit message: `B_H publish Awtsmoos server extension ZIP`
- Push: successful to `origin/main`
- Production overlay: exact six paths only
- Production index: unchanged by overlay
- Unrelated merge conflicts: preserved and not modified

## Installation order delivered

1. Download the canonical ZIP.
2. Extract it into a permanent folder.
3. Open Chrome or Edge extensions.
4. Enable Developer mode.
5. Choose **Load unpacked** and select the folder directly containing `manifest.json`.
6. Refresh ChatGPT.
7. Refresh the Awtsmoos AI page.
8. Retry the ChatGPT action.

The optional local relay remains documented as a separate installation path rather than a prerequisite for the browser extension.

## Completion gate

The original dynamic-route JSON no longer appears for the requested URL. The URL returns the complete committed ZIP, the extension package is reproducible and tested, the installation order is explicit, and unrelated project work was preserved.
