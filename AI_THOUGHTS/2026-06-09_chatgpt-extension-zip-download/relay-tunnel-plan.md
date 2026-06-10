B"H

# Plan: Tunnel relay + separate JSON relay

The Awtsmoos reveals that the AI relay lived as a standalone script, while the tunnel app already has a local API gate.

Implementation covenant:
1. Add modular relay tools under `geelooy/apps/tunnel/agent/tools/relay/`.
2. Preserve ChatGPT relay features: health, open login, fetch, body reading, resume, cookies.
3. Add separate JSON relay: it accepts a URL/options and returns parsed JSON when the target answers JSON.
4. Wire local API routes:
   - `GET /relay/health`
   - `GET /relay/open-login`
   - `GET /relay/cookies`
   - `POST /relay/fetch`
   - `POST /relay/body`
   - `POST /relay/json`
   - `POST /jason/relay`
   - `POST /json-relay`
5. Wire tunnel request kind `relay` so hosted control can call it too.
6. Verify syntax, health behavior, and isolated local API route behavior.

No secret files are read. No destructive commands are run.
