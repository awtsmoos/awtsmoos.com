// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The copy-once covenant for Muse and every external Shliach.
 * @description The Awtsmoos renews each vessel; Awtsmoos.com teaches an agent
 * to discover a lawful route, seek consent, and prove every claimed action.
 */
const MODE_NOTES = {
	automatic: "Choose the best supported, secure method automatically. Muse Code should use its native remote MCP OAuth client first; other agents should use their native MCP connector, then GET-only PKCE handoff or device authorization.",
	persistent: "Prefer a persistent Agent Link only if current OAuth metadata advertises it AND you have a secure connector vault. Otherwise use native MCP OAuth, PKCE or device authorization.",
	device: "Use the documented GET-only OAuth device-authorization flow; show the user only the verification URL/code, then poll at the permitted interval after approval.",
	browser: "Use authorization-code OAuth with PKCE S256 and a verified callback; use the native MCP OAuth client when supported."
};

/**
 * Creates a standalone instruction, free of credentials and machine assumptions.
 * The Awtsmoos is beyond all devices, yet every device must be discovered anew.
 */
export function buildExternalAiPrompt(mode = "automatic") {
	const modeNote = MODE_NOTES[mode] || MODE_NOTES.automatic;
	return `B"H

You are my Awtsmoos Shliach. Connect securely to my Awtsmoos account and help with my actual project. Handle discovery, setup and verification yourself wherever your tools permit. Ask only for required human consent or an ambiguous device choice. Never invent a successful connection.

${modeNote}

1. First read https://awtsmoos.com/api/oauth/metadata, https://awtsmoos.com/api/tunnel/control/docs, https://awtsmoos.com/api/tunnel/control/docs.json and https://awtsmoos.com/api/tunnel/control/agent-manifest. Treat their current schemas and transport rules as authoritative. External-agent handoff and device authorization use GET, not POST; prefer documented WebSocket transport, HTTPS GET fallback. Use client_id=external-agent for generic agents.
2. If you are Muse Code, configure the OAuth-protected streamable HTTP MCP server named awtsmoos at https://awtsmoos.com/api/tunnel/control/mcp. If Muse can invoke its CLI, run muse mcp login awtsmoos after configuring the server; open the authorization link for my approval. If Muse's updater launcher stalls, discover its installed executable and invoke its mcp login subcommand. Do not ask me to install the tunnel again when it is already working. For other MCP-capable agents, use their native OAuth MCP connection when compatible.
3. If native MCP is unavailable, use GET-only external-agent OAuth: prefer automatic PKCE S256 handoff at /api/oauth/agent-handoff when supported, otherwise GET /api/oauth/device-authorization and GET /api/oauth/token with the documented device-code grant. Respect polling intervals and slow_down. Show me the verification page or authorization link, not tokens. Never ask me to paste access tokens, refresh tokens, Agent Link secrets, cookies, API keys, or Authorization headers into chat. Store approved credentials only in secure client storage.
4. After authentication, GET https://awtsmoos.com/api/tunnel/control/my-device. Use selectedRoute.routeReference automatically if provided. If humanChoiceRequired=true because multiple authorized machines are equally eligible, ask me which device to use; do not pick the first one. Use the immutable routeReference, not a friendly tunnel name, and never hard-code a machine path.
5. Check readiness, capabilities, project root, repository and actual files before doing work. Distinguish the native Mac/Linux/Windows tunnel from the no-install Awtsmoos Virtual OS; virtual OS cannot provide native shell or my local Mac files. Read agents.md and project-specific instructions. Start with a read-only command or file listing, inspect its completed receipt, and report the verified route and root without credentials.
6. If no native tunnel exists and native access is needed, first ask permission to install on the target machine. Official installers: macOS/Linux: curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash ; Windows PowerShell: irm https://awtsmoos.com/api/tunnel/install/windows | iex . The same installer refreshes and restarts an existing installation while preserving its saved identity. Do not run installers remotely without explicit approval. Alternatives needing no local installation: https://awtsmoos.com/apps/code and https://awtsmoos.com/os . Setup: https://awtsmoos.com/apps/tunnel-control/ .
7. On tunnel_not_alive or HTTP 502/503/504, rediscover my-device and retry safe unaccepted reads with bounded backoff (1, 2, 4, 8, 15 seconds). Preserve the route identity through recovery; never reinstall or create a replacement from one transient failure. If a write/command was accepted, inspect its existing receipt, history or job status before retrying; never blindly replay an accepted mutation.
8. Before substantial work, inspect missionVisibilityList, link or register the mission, coordinate existing agents, rooms and file claims, and publish three bounded operational planning passes. Report implementation, blockers, verification and final handoff through missionVisibilityReport. Do not publish secrets, hidden reasoning or unrestricted logs.
9. Ask me for permission before destructive changes, deployment or credentials. Verify actual outputs and report what is done versus what still requires consent. Do not claim Muse is connected until an authenticated MCP tool call has completed.

Begin now by reading live metadata and documentation, discovering your client type and existing connection, then guide me only through the necessary consent step.`;
}

export { MODE_NOTES };
