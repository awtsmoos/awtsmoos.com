# B"H — Geelooy API Master Index (Yaakov 2026-10-15)

Complete API documentation for Awtsmoos.com.

## Core APIs

### Tunnel (`/api/tunnel/`)
Secure remote command execution and device management.
- `control/` — Pairing, commands, WebSocket, device management
- `install/` — Installer scripts (7 tunnel choices) and agent bundles
- `lanes/` — Simple tunnel lanes (permanent baseline)
- See `tunnel/README.md` for details.

### OAuth (`/api/oauth/`)
Authentication and authorization.
- `core/` — OAuth core logic
- `routes/` — OAuth endpoints
- `views/` — Login/consent pages

### Admin (`/api/admin/`)
Administrative endpoints.

### Contact (`/api/contact/`)
Contact form and messaging.

### Email (`/api/email/`)
Email sending and templates.

### GPT (`/api/gpt/`)
GPT integration endpoints.

## Documentation Standards

Each API directory should have a README.md explaining:
1. What the API does
2. Main endpoints/routes
3. Request/response formats
4. Authentication requirements
5. Critical bugs fixed and lessons learned

## For AI Agents

**Before modifying tunnel code, read:**
1. `tunnel/README.md` — Overview and lessons learned
2. `tunnel/control/README.md` — Pairing flow and critical bugs
3. `tunnel/lanes/HOW_TO_RUN_COMMANDS.md` — How to test each lane

**Critical rules:**
- Simple tunnel is PERMANENT BASELINE — never remove
- Always save pairing credentials (requestSecret) immediately
- Test with real commands, not just code review
- Bump manifest version to rebuild agent bundle
