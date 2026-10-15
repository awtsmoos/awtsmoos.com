# B"H — Simple Tunnel Lanes (Yaakov 2026-10-15)

**PERMANENT BASELINE** — Never remove. These are the foundational tunnel lanes.

## Lanes

### 1. Poll (`agent-poll.js`)
HTTP polling, no approval. For trusted environments.
- Agent polls `GET /simple/poll?agentId=...`
- Server queues via `POST /simple/cmd` (supports `agentId` targeting)
- **Tested:** ✅ Commands work bidirectionally

### 2. Approval (`agent-approval.js`)
File-based approval. For semi-trusted environments.
- Agent requests approval, waits for `.approved` file
- Server endpoints: `POST /simple/request`, `GET /simple/approved`
- **Tested:** ✅ Full flow works (request → approve → command)

### 3. WebSocket (`agent-websocket.js`)
WebSocket real-time, falls back to polling.
- Tries WebSocket first, falls back to HTTP polling
- Uses ayzarim WebSocket infrastructure
- **Tested:** ⚠️ Fallback works, WS path untested

### 4. File (`agent-file.js`)
Pure file, zero HTTP. For air-gapped environments.
- Agent watches `/tmp/simple-tunnel-commands/<agentId>.json`
- Writes results to `/tmp/simple-tunnel-results/<agentId>/<id>.json`
- **Tested:** ✅ File-based execution works

### 5. Resilient (`agent-resilient.js`)
Wrapper that auto-restarts any agent on crash.
- Usage: `TUNNEL_AGENT_FILE=agent-poll.js node agent-resilient.js`

## Tools

- `install-lane.js` — Beautiful installer with lane picker
- `verify-lanes.js` — Beautiful verification script (5/5 tests pass)
- `simple-tunnel-agent.service` — Systemd unit for background operation

## Tunnel Selection

Commands can target specific agents via `agentId`:
```bash
curl -X POST .../simple/cmd -d '{"secret":"...","command":"...","agentId":"my-macbook"}'
```

Agents identify via `TUNNEL_AGENT_ID` env var (defaults to hostname).

## Documentation

- `HOW_TO_RUN_COMMANDS.md` — Complete guide for each lane
- `README.md` — This file
