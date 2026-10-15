# B"H — Tunnel Installer (Yaakov 2026-10-15)

Serves installer scripts and agent bundles.

## Endpoints

- `GET /api/tunnel/install/unix` — Bash installer (shows menu with 7 tunnel choices)
- `GET /api/tunnel/install/agent.zip` — Agent bundle (v1.0.668+, rebuilt with fixes)
- `GET /api/tunnel/install/windows` — PowerShell installer
- `GET /api/tunnel/install/status` — Installer status

## Installer Menu (7 Choices)

1. **Full** (recommended) — Complete tunnel with browser support, RSA pairing
2. **Minimal** — Agent + registration, uses system Node.js
3. **Agent only** — Fastest, for headless servers
4. **Simple (poll)** — File-based, no pairing, HTTP polling
5. **Simple (approval)** — File-based with manual approval step
6. **Simple (websocket)** — Real-time, falls back to polling
7. **Simple (file)** — Pure file, zero HTTP, air-gapped capable

Plus auth management:
8. Delete old auth — Remove all credentials, start fresh
9. Reset tunnel — Clear config, keep auth
10. Continue — Keep existing auth and config

## Agent Bundle

Built dynamically from `geelooy/apps/tunnel/agent/` via `tools/zipBundle.js`.

**Cache:** Expires after 60 seconds (was: only on manifest change).
**Version:** Bump `geelooy/apps/tunnel/agent/manifest.txt` to force rebuild.

## Key Files

- `_awtsmoos.derech.js` — Route definitions
- `scripts/unix.js` — Serves the bash installer
- `tools/zipBundle.js` — Builds agent.zip
- `tools/scriptRoute.js` — Serves script files
- `../downloads/unix.sh` — The actual bash installer (now in git!)
