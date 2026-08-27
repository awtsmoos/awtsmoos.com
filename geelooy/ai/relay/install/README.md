B"H
Boruch Hashem
Blessed is He

# Awtsmoos Relay Install Guide

> The Awtsmoos renews source and vessel in their proper place;
> Awtsmoos.com publishes the ZIP from exact Git light without storing the archive in Git's embrace.

This folder is the public install surface for the Awtsmoos Server browser extension and optional local relay.

The extension archive is **published outside Git**. Repository hygiene intentionally ignores and forbids tracked `.zip` files. The durable source of truth is `geelooy/scripts/tricks/extensions/server`, and `geelooy/ai/scripts/buildServerExtensionZip.cjs` generates the public archive from that source.

Canonical public URL:

`https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip`

## Browser-extension install order

1. Download the ZIP from the canonical public URL.
2. Extract the ZIP into a permanent folder.
3. Confirm the extracted folder directly contains `manifest.json`.
4. Open your Chromium-compatible browser's extensions page.
5. Enable developer mode if the browser requires it for unpacked extensions.
6. Choose **Load unpacked** and select the folder that directly contains `manifest.json`.
7. Refresh ChatGPT first so the Awtsmoos Server content scripts and background worker attach to a fresh page.
8. Refresh the Awtsmoos AI page after ChatGPT is ready.

If the browser reports a service-worker registration error, install a freshly downloaded package rather than reusing an older extracted directory. The production release path rebuilds the ZIP from the exact deployed Git revision so `background.js` and every `importScripts(...)` dependency ship together.

## Rebuild from repository source

From the repository root:

```bash
node geelooy/ai/scripts/buildServerExtensionZip.cjs
node --test geelooy/ai/tests/extensionZipPackage.test.cjs
```

The generated archive appears at:

`geelooy/ai/relay/install/awtsmoos-server-extension.zip`

That file is a generated publication artifact. Do not force-add it to Git. The package test proves its entries and bytes match the canonical extension source and verifies the background worker's local dependency closure.

## Production publication

Canonical production activation runs `buildServerExtensionZip.cjs` after exact-SHA and clean-repository checks, before restarting the service. This recreates the ignored public ZIP from the same source revision that production is about to serve.

A release is not verified merely because GitHub accepted a push. Confirm the public URL returns the generated package and that its contents match the deployed source.

## Optional local-relay install order

1. Install the browser extension first.
2. Start the local Awtsmoos relay using the platform installer exposed by the UI.
3. Confirm the relay reports healthy connectivity.
4. Refresh ChatGPT.
5. Refresh the Awtsmoos AI page.

The browser extension can provide the transport directly; the local relay is an additional transport path rather than a substitute for a correctly packaged extension.
