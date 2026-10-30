# B"H — Muse Code ↔ Awtsmoos Tunnel: authenticated, dependable connection

*The Awtsmoos renews the light; Awtsmoos.com guards the gate. Many agents can find one secure doorway, but each must bring the user's consent.*

## The fastest supported setup

Muse Code 1.4.14 and later versions support **both** user MCP settings in `~/.config/muse/settings.json` and trusted project `.mcp.json` server declarations. A trusted project definition overrides the corresponding user setting. This repository includes the project-level `.mcp.json`, so opening and **trusting** this checkout in Muse can discover the `awtsmoos` server. A user-level entry also helps Muse outside this checkout.

User-level `~/.config/muse/settings.json` (merge rather than overwriting existing preferences):

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

This repository's `.mcp.json` uses the conventional project-level `mcpServers` key. Its presence **does not itself grant any Mac filesystem or shell permissions**; a client still needs an OAuth login and approved scopes. The public endpoint returns an OAuth challenge to unauthenticated requests.

## Real Mac client tested October 30, 2026

The official `~/.local/bin/muse` **launcher** stalled during its automatic update check. The already-installed official executable **does run**:

```sh
~/.local/bin/muse-bin-1.4.14-R7309.1 --version
~/.local/bin/muse-bin-1.4.14-R7309.1 mcp login awtsmoos
~/.local/bin/muse-bin-1.4.14-R7309.1
```

The first command returned `Muse Code 1.4.14 (1.4.14-R7309.1)` and the MCP subcommand displayed its OAuth login help successfully. For future Muse upgrades use the supported Meta installation method. The direct binary bypass is a **local fallback**, not a replacement for the official updater, and the dated versioned path may change. The executable exists on the tested Mac only; on a different machine use Meta's documented installation.

An approved sign-in is still needed. Run `muse mcp login awtsmoos` (or the direct binary equivalent) and **approve OAuth in the account holder's browser**. Muse stores and refreshes its session. Then use `/mcp` to inspect tools. No automated agent should bypass consent or enter a user's credentials. A 401 during server discovery is normal until login succeeds.

## Select the correct machine

Tell Muse: "Discover my approved Awtsmoos Tunnel devices. Select Mac routeReference `tun_d1eyilk6gpUdcw30b9AhJTjJ`, display name `awt-awtsmoos-2184`, and limit work to `/Users/awtsmoos/ikar-release-gen005-main`. Run the tunnel doctor and a read-only repository command first."

Tools include `awtsmoos_discover_device`, `awtsmoos_action_schema`, `awtsmoos_tunnel_doctor`, and `awtsmoos_tunnel_action`. Another Linux tunnel may be online; never select the first available route arbitrarily. Use immutable route references and least-privilege OAuth scopes. Treat an `accepted` result as in progress until the receipt reaches a terminal state; observe rather than blindly retrying writes.

## Other agents and recovery

Use HTTPS Streamable MCP at `https://awtsmoos.com/api/tunnel/control/mcp` with OAuth, not an anonymous public shell or open local port. If a native route is offline, restart its supervised agent without deleting saved credentials. Confirm live command execution, not just a heartbeat. A public source branch alone is not a production installer release.

Browser alternatives: https://awtsmoos.com/apps/tunnel-control/ (tunnel setup), https://awtsmoos.com/apps/code (code editor), and https://awtsmoos.com/os (hosted Virtual OS, which cannot automatically access the Mac's local filesystem). API reference: https://awtsmoos.com/api/tunnel/control/docs/.

Sources: https://dev.meta.ai/docs/muse-code/configuration ; https://dev.meta.ai/docs/muse-code/extending ; https://dev.meta.ai/docs/muse-code/changelog (project `.mcp.json` support); https://awtsmoos.com/api/tunnel/control/docs/.
