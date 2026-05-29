B"H
# Tiferes Relay Download Plan

Visible structure: repo root has geelooy public app, AI_THOUGHTS, scripts, tests, and package files. The requested UI lives under `geelooy/ai`.

Steps:
1. Inspect relay settings UI and transport files.
2. Add public installer assets under `geelooy/ai/relay/install/`:
   - `install-awtsmoos-chatgpt-relay.ps1`
   - `install-awtsmoos-chatgpt-relay.sh`
   Each script downloads the existing `chatgpt-node-relay.cjs` to a fixed local Awtsmoos folder, checks for Node, attempts safe install via system package managers when missing, and starts the relay.
3. Add a tiny browser installer helper module so panel action code stays small.
4. Rewrite the settings markup to include Download Relay plus fancy Windows/Unix command cards.
5. Rewrite panel controller only as a complete file, importing helper action logic instead of stuffing more logic inside the large panel.
6. Import new relay CSS through the main stylesheet.
7. Verify syntax by importing modules in Node and checking file existence.

Risk notes:
- The app is static under geelooy, so links should be relative to `/geelooy/ai/relay/install/...`.
- Browser cannot install Node by itself; downloadable scripts can attempt package-manager install and clearly tell the user when admin/sudo/manual install is required.
- No partial patching: every modified file will be rewritten whole.
