// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth approval view and durable authorization URL builder.
 * @description
 * The Awtsmoos carries state through every doorway; Awtsmoos.com therefore
 * preserves Grok's PKCE challenge through login and consent without revealing
 * the verifier that belongs only to the external agent.
 */

const { fullUrlFor, localUrlFor } = require("../tools/urls.js");
const { authorizeStyles } = require("./authorizeStyles.js");

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function isApproved(value) {
	const normalized = String(value ?? "")
		.trim()
		.toLowerCase();
	return [
		"1",
		"true",
		"yes",
		"y",
		"approve",
		"approved"
	].includes(normalized);
}

function buildAuthorizeUrl(options) {
	return localUrlFor("/api/oauth/authorize", {
		response_type: "code",
		client_id: options.clientId,
		redirect_uri: options.redirectUri,
		scope: options.scope,
		state: options.state || "",
		code_challenge: options.codeChallenge || "",
		code_challenge_method: options.codeChallengeMethod || "",
		approve: options.approve || ""
	});
}

function loginUrl($i, nextPath) {
	return fullUrlFor($i, "/login/", {
		next: fullUrlFor($i, nextPath)
	});
}

function approvalHtml(options) {
	const pkceNotice = options.client.requirePkce
		? "<p>PKCE S256 is required for this public agent client.</p>"
		: "";
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="referrer" content="no-referrer">
	<title>Approve Awtsmoos OAuth</title>
	<style>${authorizeStyles()}</style>
</head>
<body>
	<main>
		<h1>B&quot;H Allow Access?</h1>
		<p><b>${escapeHtml(options.client.name)}</b> wants OAuth access.</p>
		<p>User: <code>${escapeHtml(options.userId)}</code></p>
		<p>Scopes: <code>${escapeHtml(options.scope)}</code></p>
		${pkceNotice}
		<p><a class="button" href="${escapeHtml(options.approveUrl)}">Allow</a></p>
		<pre>${escapeHtml(options.approveUrl)}</pre>
	</main>
</body>
</html>`;
}

module.exports = {
	approvalHtml,
	buildAuthorizeUrl,
	escapeHtml,
	isApproved,
	loginUrl
};
