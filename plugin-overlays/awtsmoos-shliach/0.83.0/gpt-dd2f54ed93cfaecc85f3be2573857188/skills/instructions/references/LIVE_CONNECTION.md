<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# The Awtsmoos opens the authenticated tunnel

Use the configured Streamable HTTP endpoint https://awtsmoos.com/api/tunnel/control/mcp.
Its JSON-RPC transport is POST, even when an underlying legacy tunnel action uses GET.
GET on the MCP endpoint returns 405 with Allow: POST; this is the advertised transport contract.

A 401 WWW-Authenticate challenge points to protected resource metadata.
The authorization server metadata now advertises /api/oauth/register.
Let the host register its actual callback with this endpoint; never invent callback IDs.
The generated public client requires S256 PKCE, exact HTTPS callback matching and explicit user consent.
The host retains OAuth credentials. Ask for account linking only when the host actually requires it.

Authorization codes and refresh tokens preserve the exact MCP resource audience.
OAuth discovery and successful client registration do not prove user authorization or device liveness.
After linking, initialize, list live tools, bootstrap and discover the authorized device before acting.

Resolve instructions with the real task and all known/planned paths plus tags ["awtsmoos-shliach"].
Fetch every returned requiredInstructionId and applicable project layer in full.
The server can return server.shliach.tunnel-native-workflow and server.shliach.poetic-code-covenant
through the existing authenticated instruction broker. Consume the returned IDs rather than assuming a list.
Later server additions and scoped project instructions may add applicable guidance.
Use live plan and mission schemas; keep the uploaded engines as retained source history.

If linking fails, distinguish metadata, registration, consent, token exchange, scope and device errors.
Report the actual status and a concrete recovery step; never describe an untested connection as working.
