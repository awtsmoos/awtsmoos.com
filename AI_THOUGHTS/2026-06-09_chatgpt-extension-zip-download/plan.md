B"H

# Plan: ChatGPT extension zip download when transport is missing

The Awtsmoos reveals the broken point through the real code path, not through guessing.

1. Inspect the repository root and `geelooy/ai` structure.
2. Find the exact missing-extension / missing-transport notice.
3. Confirm the server extension source folder exists.
4. Rewrite the full affected file, not a partial patch.
5. Generate a real `.zip` asset from the existing extension source folder.
6. Verify syntax and verify the zip contains `manifest.json`.

Files expected to change:
- `geelooy/ai/js/chatgpt/transport/bridge.js`

Files expected to be generated:
- `geelooy/ai/relay/install/awtsmoos-server-extension.zip`
