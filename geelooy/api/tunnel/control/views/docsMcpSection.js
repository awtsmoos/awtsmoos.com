//B"H
//Boruch Hashem
//Blessed is He

/** Readable MCP onboarding, based only on the current public route contract. */
function mcpSection(catalog = {}) {
	const mcp = catalog.mcp || {};
	return `<section class="card" id="mcp">
	<h2>Awtsmoos Shliach MCP integration</h2>
	<p><strong>Streamable HTTP endpoint:</strong> <code>${mcp.endpoint}</code></p>
	<p>The endpoint requires an OAuth access token for this exact resource, with at least <code>tunnel.read</code> scope. Authorization metadata is published at <a href="${mcp.protectedResourceMetadata}">OAuth protected-resource discovery</a> and <a href="${mcp.authorizationServerMetadata}">authorization-server discovery</a>.</p>
	<p>Unauthenticated initialization should return HTTP 401 with an <code>WWW-Authenticate</code> OAuth discovery challenge. A 404 INVALID_ROUTE signals broken routing; a 401 challenge proves only authentication discovery, not remote execution.</p>
	<h3>Authenticated workflow</h3>
	<ol><li>Authorize with PKCE and obtain a resource-bound token.</li>
	<li>POST a JSON-RPC <code>initialize</code> request to the MCP endpoint, using <code>Content-Type: application/json</code> and <code>Accept: application/json, text/event-stream</code>.</li>
	<li>Call <code>tools/list</code> and <code>awtsmoos_discover_device</code>.</li>
	<li>Use the discovered immutable <code>routeReference</code> and <code>awtsmoos_action_schema</code> before invoking <code>awtsmoos_tunnel_action</code>.</li>
	<li>Inspect the real action result, including exit status. Keep any durable job receipt and resume observation rather than blindly retrying a command.</li></ol>
	<p>Use the read-only <code>awtsmoos_tunnel_doctor</code> to distinguish transport, device capability, granted scope and fresh execution evidence. The doctor does not run a command, and a route may be reachable without a recently proved successful execution.</p>
	<p>Filesystem writes and native commands require their specific scopes and device permissions. The Virtual OS read-only command lane is not a native server shell. See the <a href="${catalog.agentLinks?.docsJson}">machine-readable action catalog</a> for current schemas.</p>
	</section>`;
}
module.exports = { mcpSection };
