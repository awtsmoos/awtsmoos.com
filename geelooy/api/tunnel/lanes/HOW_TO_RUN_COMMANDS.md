# B"H — How to Run Commands From Each Tunnel Lane (Yaakov 2026-10-15)

## Lane 1: Simple Tunnel — Poll (BASELINE, permanent)

**What:** HTTP polling command tunnel. The proven working baseline.

**Server endpoints** (on https://awtsmoos.com):
- `POST /api/tunnel/control/simple/cmd` — Queue a command (requires secret)
- `GET /api/tunnel/control/simple/poll` — Agent polls for commands
- `GET /api/tunnel/control/simple/result?id=...&secret=...` — Get command result

**Run a command:**
```bash
# 1. Queue a command (from anywhere):
curl -s -X POST https://awtsmoos.com/api/tunnel/control/simple/cmd \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SECRET","command":"hostname && date"}'
# Returns: {"ok":true,"id":"cmd_123..."}

# 2. Get the result (after ~5 seconds):
curl -s "https://awtsmoos.com/api/tunnel/control/simple/result?secret=YOUR_SECRET&id=cmd_123..."
# Returns: {"ok":true,"done":true,"output":"..."}
```

**Run the agent** (on target machine):
```bash
node geelooy/api/tunnel/lanes/simple/agent-poll.js
# Env vars: TUNNEL_SERVER, TUNNEL_SECRET, TUNNEL_QUEUE_FILE, TUNNEL_POLL_MS
```

---

## Lane 2: Simple Tunnel — Approval

**What:** Same as poll, but requires manual approval before agent starts.

**Run a command:**
```bash
# 1. Agent requests approval (on target machine):
TUNNEL_AGENT_ID=myserver node geelooy/api/tunnel/lanes/simple/agent-approval.js
# Output: "Waiting for approval..."

# 2. Approve (on server, via any command lane):
touch /tmp/simple-tunnel-approvals/myserver.approved

# 3. Agent starts polling. Then use Lane 1 commands.
```

**Server endpoints:**
- `POST /api/tunnel/control/simple/request` — `{"agentId":"..."}`
- `GET /api/tunnel/control/simple/approved?agentId=...` — `{"approved":true/false}`

---

## Lane 3: Simple Tunnel — WebSocket

**What:** WebSocket real-time lane. Falls back to polling if WS unavailable.

**Run the agent:**
```bash
node geelooy/api/tunnel/lanes/simple/agent-websocket.js
# Tries WebSocket first, falls back to HTTP polling automatically.
```

**Note:** Uses the ayzarim WebSocket server infrastructure
(`ayzarim/awtsmoosDynamicServer/websocket/`). The fallback ensures
it always works even without a dedicated WS endpoint.

---

## Lane 4: Simple Tunnel — Pure File (zero HTTP)

**What:** 100% file-based. No network. For air-gapped environments.

**Run a command:**
```bash
# 1. Write command file (on target machine, or via another lane):
echo '[{"id":"cmd1","command":"echo hello"}]' > /tmp/simple-tunnel-commands/myserver.json

# 2. Agent picks it up and writes result to:
# /tmp/simple-tunnel-results/myserver/cmd1.json

# 3. Read the result:
cat /tmp/simple-tunnel-results/myserver/cmd1.json
```

**Run the agent:**
```bash
TUNNEL_AGENT_ID=myserver node geelooy/api/tunnel/lanes/simple/agent-file.js
```

---

## Lane 5: Full Tunnel (pairing/RSA)

**What:** The standard production tunnel with RSA pairing.

**Standard install command:**
```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

**What happens:**
1. Installer generates RSA keypair
2. Gets pairing code, shows approval URL with beautiful CLI
3. You approve in browser
4. Installer polls `pairing/state` until approved (now fixed for GET)
5. Receives encrypted credential, starts tunnel
6. CLI shows styled success messages (now with ANSI colors)

**Pairing API** (for manual testing):
```bash
# Create pairing:
curl -s -X POST https://awtsmoos.com/api/tunnel/control/pairing/request \
  -H "Content-Type: application/json" \
  -d '{"devicePublicKey":"rsa-spki-base64url:...","deviceId":"...","tunnelName":"..."}'

# Check state (now works with GET):
curl -s "https://awtsmoos.com/api/tunnel/control/pairing/state?pairingId=pair_..."
```

---

## Lane 6-13: Recovery Lanes (emergency infrastructure)

**Location:** `geelooy/apps/tunnel/agent/recovery/lanes/`

These are NOT command tunnels. They are emergency recovery systems:
- `httpServer.js` — Recovery HTTP API (port 3977). Test: `curl http://localhost:3977/health`
- `unixSocket.js` — Unix-domain socket for local IPC
- `fileTrigger.js` — Watches atomic files, survives network failure
- `primaryGuardian.js` — Keeps primary process alive
- `sealedTier0.js`, `secondaryDirectTunnel.js`, etc. — Specialized recovery

**They do not run arbitrary shell commands.** Use the simple tunnel lanes for commands.

---

## Quick Reference

| Lane | Command Channel | Needs Server | Tested |
|------|----------------|--------------|--------|
| Poll | HTTP polling | Yes | ✅ Yes |
| Approval | HTTP + file approval | Yes | ✅ Server endpoints |
| WebSocket | WS (fallback: polling) | Yes | ⚠️ Fallback only |
| Pure File | Files only | No | ✅ Mechanism |
| Full Tunnel | WebSocket + RSA | Yes | ✅ Endpoints |
| Recovery | Various | Local | ✅ httpServer |
