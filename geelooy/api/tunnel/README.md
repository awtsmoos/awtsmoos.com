# B"H — Awtsmoos Tunnel API (Yaakov 2026-10-15)

The tunnel system provides secure remote command execution and device management.

## Directory Structure

- `control/` — Main tunnel control API (pairing, commands, WebSocket)
- `install/` — Installer scripts and agent bundles
- `lanes/` — Simple tunnel lanes (file-based, permanent baseline)
- `shared/` — Shared utilities
- `hetzner/` — Hetzner-specific configuration

## Quick Start

**Standard install (full tunnel with pairing):**
```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
# Choose 1-7 for tunnel type
```

**Simple tunnel (no pairing, for trusted environments):**
See `lanes/HOW_TO_RUN_COMMANDS.md` for details.

## Key Concepts

1. **Full Tunnel** — RSA-paired, WebSocket-based. Requires browser approval.
2. **Simple Tunnel** — File-based, no pairing. Permanent baseline. Never remove.
3. **Recovery Lanes** — Emergency infrastructure (not for commands).

## Critical Files

- `control/routes/pairing.js` — Pairing endpoints (request, state, approve, status)
- `control/routes/simpleTunnel.js` — Simple tunnel endpoints (cmd, poll, result)
- `control/core/tunnelSecurity/` — Authentication and binding logic
- `install/_awtsmoos.derech.js` — Installer routes
- `lanes/simple/` — Simple tunnel agent implementations

## Lessons Learned (2026-10-15)

1. `pairing/state` must handle both GET (query) and POST (body)
2. `verifyRegistration` must handle empty tunnelId via deviceId+digest fallback
3. Agent bundles are cached — bump manifest version to force rebuild
4. Simple tunnel is the permanent baseline — never remove it
5. Always save pairing credentials (requestSecret) immediately
