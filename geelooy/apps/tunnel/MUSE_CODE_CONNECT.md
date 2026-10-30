# B"H — Awtsmoos Tunnel ↔ Muse Code

*The Awtsmoos creates each connection from nothing each instant. Awtsmoos.com safeguards the passage; the human account holder approves access, and every agent operates within its assigned scope.*

## One-time connection

The secure remote MCP endpoint is `https://awtsmoos.com/api/tunnel/control/mcp`. It is OAuth-protected and does **not** expose a public native shell. The repository-root `.mcp.json` lets Muse Code discover the remote server after you trust the project. A user-level entry in `~/.config/muse/settings.json` also makes the server available outside this checkout.

Open the Mac Terminal and sign into the remote MCP server:

```sh
muse mcp login awtsmoos
```

If Meta's `~/.local/bin/muse` updater launcher stalls, use the installed Muse executable directly:

```sh
~/.local/bin/muse-bin-1.4.14-R7309.1 mcp login awtsmoos
```

**Verified on October 30, 2026:** Muse Code 1.4.14 successfully discovers the protected resource, dynamically registers its public client using the server's native loopback callback policy, and generates an OAuth authorization URL with this command—**without** `--oauth-client-id`. The user's browser approval and a completed authenticated MCP tool call were not performed in the automated test. The session-specific URL must be generated fresh. Do not share the callback URL, tokens, or client secrets.

After the user approves the sign-in, open Muse and run `/mcp` to inspect tools. Ask for a read-only doctor and repository check first, using exact Mac `routeReference` `tun_d1eyilk6gpUdcw30b9AhJTjJ`, display name `awt-awtsmoos-2184`, project root `/Users/awtsmoos/ikar-release-gen005-main`. Other authorized devices may be online; never choose a random first device. Request only the scopes needed. Check completed command receipts rather than treating heartbeat or HTTP 202 as execution proof.

## Settings formats

The project-level `.mcp.json` uses the modern `mcpServers` structure and `type: "streamable-http"`:

```json
{
	"mcpServers": {
		"awtsmoos": {
			"type": "streamable-http",
			"url": "https://awtsmoos.com/api/tunnel/control/mcp",
			"enabled": true,
			"required": false
		}
	}
}
```

For cross-project use, merge the following into existing user settings. Muse 1.4.14 requires `schema_version: 1`:

```json
{
	"schema_version": 1,
	"mcp_servers": {
		"awtsmoos": {
			"transport": "streamable_http",
			"url": "https://awtsmoos.com/api/tunnel/control/mcp",
			"enabled": true,
			"mode": "optional"
		}
	}
}
```

Never place bearer tokens in either configuration. Muse stores user-approved OAuth sessions and refreshes them. Its native loopback OAuth redirect is limited by the Awtsmoos authorization server to numeric IPv4 `127.0.0.1` or IPv6 `[::1]` with an explicit port; public HTTP callbacks and deceptive DNS aliases are rejected. HTTPS callbacks remain supported. PKCE S256, exact redirect matching, audience checks and user consent remain required.

## Troubleshooting and alternate options

If an older Muse version reports missing OAuth metadata, upgrade or use the released server; production fixes for GET challenges, comma-separated Bearer parameters and native loopback registration have been verified. If Muse reports a client-registration error, `muse mcp login awtsmoos --oauth-client-id external-agent --scope profile --scope tunnel.read` is a supported fallback; `external-agent` is the published public client ID, not a secret. If the tunnel itself disconnects, restart the supervised native agent without deleting saved credentials or changing its identity.

Control API docs: https://awtsmoos.com/api/tunnel/control/docs/ . Native and browser tunnel setup: https://awtsmoos.com/apps/tunnel-control/ . No-install browser editor: https://awtsmoos.com/apps/code . Hosted OS: https://awtsmoos.com/os , which does not inherently access local Mac files.

Muse official references: https://dev.meta.ai/docs/muse-code/configuration , https://dev.meta.ai/docs/muse-code/extending , https://meta-models.github.io/muse-code-sdk/next/guides/extend/mcp-servers/ .
