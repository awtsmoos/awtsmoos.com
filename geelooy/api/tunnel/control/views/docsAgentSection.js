// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human OAuth section for universal external AI clients.
 * @description
 * The Awtsmoos is not fenced by a model brand; Awtsmoos.com teaches one
 * capability-based PKCE path whose fixed callback guards every future client,
 * while Grok and ChatGPT remain examples rather than architectural dependencies.
 */

function docsAgentSection(catalog) {
	const oauth = catalog.oauth;
	const client = oauth.externalAgent;
	return `<section class="card" id="external-agent">
	<h2>2. Any external AI client: OAuth + PKCE</h2>
	<div class="callout"><strong>Recommended public client:</strong> <code>${client.clientId}</code> — no client secret. PKCE ${client.pkceMethod} is required.</div>
	<p>Any AI client can use this path if it can generate PKCE S256 + state, open a browser authorization URL, exchange an HTTPS authorization code, store credentials securely, and send Bearer requests.</p>
	<ol>
		<li>Read <a href="${catalog.agentLinks.oauthMetadata}">OAuth Metadata</a> or the <a href="${catalog.agentLinks.agentManifest}">Agent Manifest</a>.</li>
		<li>Generate a 43–128 character PKCE verifier, its SHA-256 base64url challenge, and a high-entropy state value.</li>
		<li>Open <code>${oauth.authorizationEndpoint}</code> with <code>client_id=${client.clientId}</code>, <code>response_type=code</code>, callback, scope, state, challenge, and <code>code_challenge_method=S256</code>.</li>
		<li>The browser returns to <code>${client.redirectUri}</code>. Carry the short-lived code and state back to the AI client.</li>
		<li>Verify returned state exactly matches the retained state, then exchange the code at <code>${oauth.tokenEndpoint}</code> with the original <code>code_verifier</code>.</li>
		<li>Store access/refresh tokens only in the AI client's credential store, then call <code>my-device</code>.</li>
	</ol>
	<pre>client_id=${client.clientId}
redirect_uri=${client.redirectUri}
code TTL=${oauth.authorizationCodeSeconds}s
access token TTL=${oauth.accessTokenSeconds}s
refresh token TTL=${oauth.refreshTokenSeconds}s</pre>
	<p><strong>Compatibility clients:</strong> Grok may continue using <code>${oauth.grok.clientId}</code>. Existing ChatGPT Actions may continue using <code>${oauth.chatgpt.clientId}</code> and their registered callbacks.</p>
</section>`;
}

module.exports = {
	docsAgentSection
};
