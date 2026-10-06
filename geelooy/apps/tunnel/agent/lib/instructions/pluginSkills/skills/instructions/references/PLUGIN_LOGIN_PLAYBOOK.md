<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# Connecting other plugins and agents to Awtsmoos

This guide applies when a user asks to let another plugin, GPT, agent, or client log into Awtsmoos. A skill file can describe authentication but cannot create a callable tool or transfer a token to another plugin. Never imply that adding prose alone equips a plugin with Mac access. Identify the target product and its actual connection surface before giving instructions.

## Choose a supported route

1. If the target already has an Awtsmoos OAuth action, inspect its live configuration and test its existing sign-in. Do not replace a working connection with a new one without reason. Legacy GPT Actions use an OpenAPI schema; the Awtsmoos endpoint is `https://awtsmoos.com/api/tunnel/control/openapi`, but verify its current response and compatibility before importing it.
2. If the target supports remote MCP, a deployed Awtsmoos MCP server can expose selected tunnel operations through streamable HTTP. Register the MCP endpoint in that product, configure OAuth 2.1 according to its requirements, scan tools, authorize the account, and test one narrow read. An OpenAPI URL is not automatically an MCP URL. Do not invent an MCP endpoint or claim one exists merely because the REST API exists.
3. If the target has a command or HTTPS client but no action connector, use Awtsmoos's `external-agent` public OAuth client directly. Follow `DIRECT_AWTSMOOS_ACCESS.md` for device authorization or PKCE S256. This worked from an execution workspace on September 24, 2026, without a ChatGPT Developer mode toggle; test connectivity again in each new environment.
4. If the target has only a browser, inspect whether it can complete OAuth and make authenticated API calls through its supported browser tools. A visible login page or a connected-tunnel screenshot is not an API credential. Never harvest browser cookies, paste bearer tokens into web forms, or use page JavaScript to evade tool restrictions.
5. If the target has none of these capabilities, state the missing connector or network requirement. Offer to build the needed server or adapter when authorized. Do not ask users to install a Mac tunnel if the requested work lives entirely in the Virtual OS.

## Builder sequence for a new integration

- Read the live agent manifest, OAuth metadata, JSON docs, and the target product's official integration documentation. Confirm its account tier and supported write actions before suggesting settings that may be absent.
- Define a small tool surface: `my-device`, specific file read/list, and only the write or command operations the task needs. Give each tool a precise schema, scope, and read/write annotation. Avoid importing hundreds of unrelated tunnel actions by default.
- Use a first-party Awtsmoos OAuth flow. With `external-agent`, choose PKCE S256 if callback handoff and secure token exchange are available; choose device authorization for a headless HTTPS client. A separately registered client may be needed for platforms with fixed redirect URIs; verify live OAuth metadata and registration support instead of guessing.
- Request the least scopes necessary. Use `profile tunnel.read` for initial discovery and reads. Add `tunnel.write`, `tunnel.command`, `tunnel.browser`, `tunnel.mission`, or `tunnel.room` only for user-requested capabilities. Advertised Mac capabilities do not enlarge the OAuth token's scopes.
- Store tokens in the target product's credential store. If it cannot store or refresh them securely, do not place them in plugin instructions, ZIP archives, Git, ordinary chat, or a public site. Use a supported secure connection instead.
- After OAuth, call `my-device` and choose an immutable `routeReference` or `tunnelId`. Handle multiple authorized, stale, and rescue routes; never silently choose a similarly named stale tunnel. Confirm a narrow API action succeeds before declaring integration complete.
- Test expired-token refresh, denied authorization, offline Mac, incorrect path, insufficient scopes, and a successful small read. Record the observed result without logging credentials or dumping private files.
- Explain to the user that authorizing one plugin does not authorize every other plugin. Each target client needs its own supported connection and consent. Do not copy tokens across plugins to make login appear automatic.

## ChatGPT-specific distinction

The Awtsmoos Shliach plugin currently packages instructions and references; no Awtsmoos MCP or old GPT Action is attached solely by those files. A personal ChatGPT account may not expose the Developer mode and full write-capable MCP setup shown in workspace guides. Check the user's actual UI and current official docs; never send them repeatedly to a missing setting. An existing old GPT Action may remain separately usable. Plugin Creator can update instructions, but an authenticated tool connection requires a supported app or MCP attachment, or direct HTTPS tools available in the current session.

## Convenient first-run wording

Tell the user the actual destination, requested scopes, and expected access: “Open this Awtsmoos verification page and approve this short code; this grants read access to inspect your selected tunnel. The code expires shortly.” Do not present a device code as a password. After approval, verify `my-device` and the exact requested read. Avoid saying “logged in” if only the authorization request started.

