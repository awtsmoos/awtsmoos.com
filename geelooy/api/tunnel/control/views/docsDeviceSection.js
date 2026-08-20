// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human documentation for headless OAuth device authorization.
 * @description
 * The Awtsmoos lets a silent daemon ask the human through a second browser;
 * Awtsmoos.com teaches the short-code ceremony, polling cadence, denial, expiry,
 * and final bearer flow without replacing the preferred PKCE callback path.
 */

function docsDeviceSection(catalog) {
	const oauth = catalog.oauth;
	return `<section class="card" id="device-login">
	<h2>3. Headless AI: Device Authorization</h2>
	<div class="callout"><strong>Use this when the AI cannot receive or relay the callback code.</strong> Browser-capable clients should prefer the PKCE flow above.</div>
	<ol>
		<li>POST <code>client_id=${oauth.externalAgent.clientId}</code> and optional <code>scope</code> to <code>${oauth.deviceAuthorizationEndpoint}</code>.</li>
		<li>The response returns <code>device_code</code>, <code>user_code</code>, <code>verification_uri</code>, <code>verification_uri_complete</code>, expiry, and polling interval.</li>
		<li>Show the verification URL and short user code to the human. The human may also open <a href="${oauth.deviceVerificationUri}">Enter Device Code</a> manually.</li>
		<li>Poll <code>${oauth.tokenEndpoint}</code> using grant type <code>${oauth.deviceGrantType}</code>, the returned <code>device_code</code>, and explicit <code>client_id=${oauth.externalAgent.clientId}</code>.</li>
		<li>On <code>authorization_pending</code>, wait and continue. On <code>slow_down</code>, increase the delay. Stop on denial, expiry, or other terminal errors.</li>
		<li>After token success, store credentials securely, call <code>my-device</code>, and use the immutable route exactly as in callback mode.</li>
	</ol>
	<pre>device session TTL=${oauth.deviceExpiresIn}s
initial poll interval=${oauth.devicePollInterval}s
device verification=${oauth.deviceVerificationUri}</pre>
</section>`;
}

module.exports = {
	docsDeviceSection
};
