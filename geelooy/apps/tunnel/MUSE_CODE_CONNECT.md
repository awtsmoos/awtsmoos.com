# B"H — Muse Code ↔ Awtsmoos Tunnel: authenticated, lasting connection

*The Awtsmoos renews the light, Awtsmoos.com guards the gate; each agent may enter by consent, each request must validate.*

## Muse on this Mac

Muse Code **does not document `.mcp.json` project auto-import**. Its official MCP configuration is `~/.config/muse/settings.json`, in a top-level `mcp_servers` object. On October 30, 2026 this machine had no Muse settings; its settings were created with the following entry. On other machines, merge the same entry rather than overwriting preferences.

```json
{
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

The repository-root `.mcp.json` is **generic MCP metadata for compatible clients**, not Muse's documented settings file. You can keep it for other clients; use Muse's actual user settings above.

## First connection

If Muse Code is not installed, use Meta's documented macOS/Linux installer: `curl -fsSL https://dev.meta.ai/install.sh | bash`, or the official binary/package manager. After Muse is installed, open this checkout, authenticate Muse itself as required by Meta, then run:

```sh
muse mcp login awtsmoos
muse
```

OAuth sign-in and scope approval **must be completed by the account holder**. Muse handles saved sessions and refresh. Within Muse use `/mcp` to check tools and authorization. A cold 401 from the Awtsmoos MCP server is a discovery challenge, not a successful authenticated connection.

Tell Muse: "Discover my authorized Awtsmoos devices and select Mac routeReference `tun_d1eyilk6gpUdcw30b9AhJTjJ` (display name `awt-awtsmoos-2184`), for project `/Users/awtsmoos/ikar-release-gen005-main`. Run doctor and a read-only repository inspection before modifying anything."

Tools include `awtsmoos_discover_device`, `awtsmoos_action_schema`, `awtsmoos_tunnel_doctor`, and `awtsmoos_tunnel_action`. Two native routes may be online, so **do not** choose the first device arbitrarily; immutable routeReference is the authority.

## Other agents

Use the HTTPS Streamable MCP endpoint `https://awtsmoos.com/api/tunnel/control/mcp` with OAuth 2.1, resource-bound tokens and least privileges. The Awtsmoos universal connector also offers a GET-based PKCE handoff and device-authorization flow for clients that cannot use MCP OAuth directly; see official control docs. Do not publicly expose Mac ports or anonymous shell access.

## Recoverability and proof

- A heartbeat identifies a live route, not necessarily successful execution. Confirm an accepted request and completed action receipt.
- Prefer immutable `routeReference`, especially when more than one device is online.
- On `tunnel_not_alive`, rediscover the same route and use bounded retries; do not reinstall after one transient error.
- On `accepted/pending`, observe the **existing** job/receipt; do not submit duplicate writes.
- A project-scoped read-only command should finish with exit code 0. A disconnected or unconsented MCP client is not operational.
- The Mac agent's supervised process and isolated device-state mission storage were repaired and locally verified in this checkout; official release/public deployment is a separate step.

## No local install required

Use https://awtsmoos.com/apps/code for the online editor or https://awtsmoos.com/os for hosted Virtual OS. These do not grant access to a Mac's local shell. The tunnel installer and status page is https://awtsmoos.com/apps/tunnel-control/; re-running the standard installer refreshes a saved tunnel identity.

References: https://dev.meta.ai/docs/muse-code/configuration ; https://dev.meta.ai/docs/muse-code/extending ; https://awtsmoos.com/api/tunnel/control/docs/
