<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Awtsmoos ChatGPT Transport Installation

The Awtsmoos renews every bridge from source to browser. This guide keeps the browser extension and the optional local relay in separate, explicit orders so one vessel is never mistaken for the other.

## Browser-extension install order

Use this path when the Awtsmoos AI page asks for the **Awtsmoos Server Extension**.

1. Download the ZIP from `https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip`.
2. Extract the ZIP into a permanent folder. Do not load the ZIP itself.
3. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the extracted folder that directly contains `manifest.json`.
6. Keep the extension enabled.
7. Refresh ChatGPT first.
8. Refresh the Awtsmoos AI page second.
9. Retry the ChatGPT action.

The archive is intentionally rooted at `manifest.json`; there is no extra wrapping folder inside it.

## Optional local-relay install order

The local relay is a separate transport choice. It is not a prerequisite for loading the browser extension.

### macOS or Linux

```sh
curl -fsSL https://awtsmoos.com/ai/relay/install/install-awtsmoos-chatgpt-relay.sh | sh
```

### Windows PowerShell

```powershell
irm https://awtsmoos.com/ai/relay/install/install-awtsmoos-chatgpt-relay.ps1 | iex
```

After the installer starts the relay:

1. Confirm the relay is listening on port `38488`.
2. Open the relay control page shown by the installer.
3. Complete any required ChatGPT sign-in in that browser session.
4. Refresh the Awtsmoos AI page.
5. Select or retry the relay-backed ChatGPT transport.

## Rebuilding the extension archive

From the repository root:

```sh
node geelooy/ai/scripts/buildServerExtensionZip.cjs
node --test geelooy/ai/tests/extensionZipPackage.test.cjs
```

The builder packages the canonical source at `geelooy/scripts/tricks/extensions/server` and refuses archives whose entries differ from that source tree.
