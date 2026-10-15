# B"H — Simple Tunnel Lanes (Yaakov 2026-10-15)

**PERMANENT BASELINE** — These are the foundational tunnel lanes. Never remove.

File-based, minimal, independent command tunnels. Each lane is a complete
standalone system for bidirectional command execution.

## Lanes

### 1. `agent-poll.js` — Polling (no approval)
- Agent polls server every 3s for commands
- Executes via shell, writes result to shared file
- No approval needed. For trusted environments.
- Server: `geelooy/api/tunnel/control/routes/simpleTunnel.js`
- Run: `node agent-poll.js`
- Env: `TUNNEL_SERVER`, `TUNNEL_SECRET` (optional), `TUNNEL_QUEUE_FILE`

### 2. `agent-approval.js` — With file-based approval
- Agent requests pairing, waits for manual approval
- Approve via: `touch /tmp/simple-tunnel-approvals/<agentId>.approved` on server
- Then uses standard poll loop
- For semi-trusted environments.

### 3. Direct (planned)
- WebSocket-based, no polling overhead
- For low-latency requirements.

## Server Endpoints
- `POST /api/tunnel/control/simple/cmd` — Queue command (requires secret)
- `GET /api/tunnel/control/simple/poll` — Agent polls (public)
- `POST /api/tunnel/control/simple/result` — Agent posts result (public, temp)
- `GET /api/tunnel/control/simple/result?id=...` — Client reads result (requires secret)

## Security Note
These are TEMPORARY fallbacks. The full tunnel uses RSA-OAEP, bindings,
and credential digests. Do not use simple lanes for sensitive operations
without additional hardening.
