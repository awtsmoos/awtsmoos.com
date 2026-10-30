# B"H — Muse Code and Awtsmoos Tunnel connection

*As the Awtsmoos renews each instant, Awtsmoos.com opens an authenticated passage; every agent must enter by permission rather than an exposed shell.*

## Discover the server securely

This checkout supplies a **project-level** `.mcp.json`, recognized by Muse Code in a trusted project:

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

The modern project format uses `mcpServers`, `type: "streamable-http"` and `required: false`. Do not use the legacy user-settings `transport` or `mode` fields inside project `.mcp.json`. Trusting this project is a local client decision; it does **not** authorize access to the Mac.

For Muse outside this checkout, merge the following into `~/.config/muse/settings.json`. **Keep `schema_version: 1`**, which the real Muse 1.4.14 binary explicitly requires:

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

This user-level legacy shape was accepted by the installed Muse CLI once its required `schema_version` was added. Merge existing preferences; never delete another client's settings or store OAuth tokens in Git. Avoid competing duplicate user-level MCP sections.

## Verified client and current OAuth interoperability blocker

On October 30, 2026 the official Muse **launcher** `~/.local/bin/muse` hung while checking for updates. Its installed executable works independently:

```sh
~/.local/bin/muse-bin-1.4.14-R7309.1 --version
~/.local/bin/muse-bin-1.4.14-R7309.1 mcp login awtsmoos --headless
```

The first prints `Muse Code 1.4.14 (1.4.14-R7309.1)`. The second now parses the configured server and reaches OAuth discovery, but **fails**:

```
muse mcp login `awtsmoos` failed: the server does not advertise MCP OAuth:
the server does not advertise MCP OAuth protected-resource metadata
```

The server already responds `401` and serves `https://awtsmoos.com/.well-known/oauth-protected-resource` with status 200 and matching `resource`. Its `WWW-Authenticate` challenge currently emits the Bearer parameters separated by spaces:

```
WWW-Authenticate: Bearer resource_metadata="https://awtsmoos.com/.well-known/oauth-protected-resource" scope="profile tunnel.read" error="invalid_token"
```

**Likely interoperability defect:** Bearer auth parameters in HTTP challenges require **comma delimiters**. The expected syntax is:

```
WWW-Authenticate: Bearer resource_metadata="https://awtsmoos.com/.well-known/oauth-protected-resource", scope="profile tunnel.read", error="invalid_token"
```

Fix and test this in the **server component that actually emits the header**; the source owner was not located in this checkout during the audit. Do not replace the hosted challenge with an anonymous endpoint or infer from a 401 that OAuth login succeeded. The missing commas are a strong hypothesis, **not yet a verified single root cause**. After a corrected server release, re-run actual Muse login to validate the fix.

## Complete authorized login after server repair

Run `muse mcp login awtsmoos` using the launcher or verified binary. Approve the browser's OAuth request, then inspect `/mcp` in Muse. Select the Mac using immutable `routeReference` `tun_d1eyilk6gpUdcw30b9AhJTjJ`, display name `awt-awtsmoos-2184`, with project scope `/Users/awtsmoos/ikar-release-gen005-main`. Another Linux tunnel may also be online. Start with `awtsmoos_tunnel_doctor` and a read-only inspection, confirming completed result receipts rather than just online heartbeat.

Other clients can connect to the same OAuth-protected Streamable HTTP endpoint. Never put bearer tokens into `.mcp.json`, bypass user authorization, or publicly expose a local shell. Native tunnel setup: https://awtsmoos.com/apps/tunnel-control/ . Hosted no-install alternatives: https://awtsmoos.com/apps/code and https://awtsmoos.com/os, which do not automatically access the Mac shell.

Docs: https://dev.meta.ai/docs/muse-code/configuration ; https://dev.meta.ai/docs/muse-code/changelog ; https://awtsmoos.com/api/tunnel/control/docs/.
