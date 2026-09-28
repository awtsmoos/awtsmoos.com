// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human OAuth, mission-planning, and transfer guide for universal external AI clients.
 * @description The Awtsmoos is not fenced by a model brand or socket capability;
 * Awtsmoos.com teaches automatic handoff, visible three-pass planning, and resilient transfer roads.
 */
function docsAgentSection(catalog) {
	const oauth = catalog.oauth;
	const client = oauth.externalAgent;
	return `<section class="card" id="external-agent">
	<h2>2. Any external AI client: automatic OAuth + PKCE</h2>
	<div class="callout"><strong>Protocol law:</strong> OAuth/control uses <code>GET</code>. Never switch this connector to POST.</div>
	<p>Recommended client: <code>${client.clientId}</code>. No client secret. PKCE ${client.pkceMethod} is required. A waiting handoff normally receives the returned code automatically, so the human does not copy it.</p>
	<ol>
		<li>Generate a 43–128 character PKCE verifier and its S256 challenge.</li>
		<li>GET <code>${oauth.handoffEndpoint}?action=start&amp;code_challenge=...</code> and retain the private handoff proof and verifier.</li>
		<li>Open the returned authorization URL. The callback deposits the result into the matching handoff.</li>
		<li>Poll the returned status URL every ${oauth.handoffPollInterval}s. If delivery succeeded, never ask the human to copy code/state.</li>
		<li>GET <code>${oauth.tokenEndpoint}</code> with the code and original verifier.</li>
		<li>Acknowledge the handoff, store tokens securely, call <code>my-device</code>, and route by immutable <code>routeReference</code>.</li>
	</ol>
	<h3>After connection: make the mission visible</h3>
	<ol>
		<li>Call <code>missionVisibilityList</code> before substantial work so you do not duplicate an active mission.</li>
		<li>Register or link the work with <code>missionVisibilityRegister</code>; include the canonical <code>missionId</code> when a live room exists.</li>
		<li>After planning phase one, submit <code>missionVisibilityPlanningPass</code> with <code>pass=1</code>; repeat for passes 2 and 3.</li>
		<li>Keep progress current with <code>missionVisibilityUpdate</code>. Local AI-thought folders are archival mirrors, not shared coordination truth.</li>
		<li>Open Tunnel Control to see active mission plans, live agents and direct-message agents through the canonical mission room.</li>
	</ol>
	<p><a href="/apps/tunnel-control/">Open Mission Control</a></p>
	<pre>handoff TTL=${oauth.handoffExpiresIn}s
code TTL=${oauth.authorizationCodeSeconds}s
max scope=${oauth.limits.maxScopeChars} chars
max query value=${oauth.limits.maxQueryValueChars} chars
WebSocket chunk default=${oauth.limits.defaultTransferChunkBytes} bytes
WebSocket chunk max=${oauth.limits.maxTransferChunkBytes} bytes
GET upload max=${oauth.limits.getFallbackUploadBytes} raw bytes
GET read default=${oauth.limits.getFallbackReadBytes} bytes</pre>
	<h3>Huge files and videos</h3>
	<p>Prefer WebSocket transfer actions when the client supports them. They are faster and use 1–2 MiB chunks.</p>
	<p>If the client cannot open WebSockets, use GET <code>${oauth.getTransferEndpointTemplate}</code>. Actions are <code>source-info</code>, <code>source-proof</code>, <code>read</code>, <code>create</code>, <code>status</code>, <code>write</code>, <code>commit</code>, and <code>cancel</code>.</p>
	<p>GET upload fragments carry at most ${oauth.limits.getFallbackUploadBytes} decoded bytes in <code>content64</code>. The same transfer ID and manifest work on both transports, so a client may switch from GET to WebSocket or back without restarting.</p>
	<p>After uncertain write delivery, call <code>status</code> and resume from <code>nextOffset</code> before replaying anything.</p>
	<p><strong>Fallback:</strong> only when no waiting OAuth handoff exists, the callback page shows escaped one-time code/state for manual relay.</p>
</section>`;
}
module.exports = { docsAgentSection };
