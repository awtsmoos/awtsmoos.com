// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file First-party OAuth callback for Grok and other chat-based agents.
 * @description
 * The Awtsmoos returns a short-lived code to human sight without ever storing
 * an access token in this page. Awtsmoos.com lets the user carry code and state
 * back to the external agent while the hidden PKCE verifier stays with its maker.
 */

const { getQuery } = require("../tools/requestData.js");
const { escapeHtml, html } = require("../tools/respond.js");

function callbackPage(query) {
	const error = String(query.error || "");
	const code = String(query.code || "");
	const state = String(query.state || "");
	const message = error
		? `<p class="error">Authorization failed: <code>${escapeHtml(error)}</code></p>`
		: `<p>Copy the authorization code and state back to Grok or your external agent.</p>
		<dl>
			<dt>Authorization code</dt>
			<dd><code>${escapeHtml(code)}</code></dd>
			<dt>State</dt>
			<dd><code>${escapeHtml(state)}</code></dd>
		</dl>`;
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="referrer" content="no-referrer">
	<title>Awtsmoos Agent OAuth Callback</title>
	<style>
		body {
			margin: 0;
			min-height: 100vh;
			display: grid;
			place-items: center;
			background: #071426;
			color: #f7faff;
			font-family: system-ui, sans-serif;
		}
		main {
			width: min(760px, calc(100vw - 32px));
			padding: 32px;
			border: 1px solid #31506d;
			border-radius: 24px;
			background: #0d2037;
		}
		code {
			word-break: break-all;
			color: #9be8ff;
		}
		dt {
			margin-top: 18px;
			font-weight: 800;
		}
		dd {
			margin: 6px 0 0;
		}
		.error {
			font-weight: 800;
		}
	</style>
</head>
<body>
	<main>
		<h1>B&quot;H Agent Authorization Returned</h1>
		${message}
		<p>This page does not exchange, save, or display access or refresh tokens.</p>
		<p>The authorization code is one-time-use and expires quickly.</p>
	</main>
</body>
</html>`;
}

function agentCallback($i) {
	return html($i, callbackPage(getQuery($i)), 200, {
		"Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
		"Referrer-Policy": "no-referrer",
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY"
	});
}

module.exports = {
	agentCallback,
	callbackPage
};
