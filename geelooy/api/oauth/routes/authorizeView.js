// B"H
// Boruch Hashem
// Blessed is He

const { fullUrlFor, localUrlFor } = require("../tools/urls.js");

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function isApproved(value) {
	const normalized = String(value ?? "").trim().toLowerCase();
	return ["1", "true", "yes", "y", "approve", "approved"].includes(normalized);
}

function buildAuthorizeUrl(options) {
	return localUrlFor("/api/oauth/authorize", {
		response_type: "code",
		client_id: options.clientId,
		redirect_uri: options.redirectUri,
		scope: options.scope,
		state: options.state || "",
		approve: options.approve || ""
	});
}

function loginUrl($i, nextPath) {
	return fullUrlFor($i, "/login/", {
		next: fullUrlFor($i, nextPath)
	});
}

function approvalHtml(options) {
	return `<!doctype html>
<html>
<head>
	<title>Approve Awtsmoos OAuth</title>
	<style>
		body {
			margin: 0;
			min-height: 100vh;
			background: #071426;
			color: #f7faff;
			font-family: system-ui;
			display: grid;
			place-items: center;
		}
		main {
			width: min(720px, calc(100vw - 32px));
			background: #0d2037;
			border: 1px solid rgba(125, 231, 255, .25);
			border-radius: 24px;
			padding: 32px;
			box-shadow: 0 24px 80px rgba(0, 0, 0, .35);
		}
		p {
			color: #b9cbe2;
			line-height: 1.55;
		}
		a.button {
			display: inline-flex;
			padding: 12px 20px;
			border-radius: 999px;
			background: linear-gradient(135deg, #7de7ff, #41bcff);
			color: #03131d;
			font-weight: 800;
			text-decoration: none;
		}
		pre {
			white-space: pre-wrap;
			word-break: break-word;
		}
	</style>
</head>
<body>
	<main>
		<h1>B"H Allow Access?</h1>
		<p><b>${escapeHtml(options.client.name)}</b> wants OAuth access.</p>
		<p>User: <code>${escapeHtml(options.userId)}</code></p>
		<p>Scopes: <code>${escapeHtml(options.scope)}</code></p>
		<p><a class="button" href="${escapeHtml(options.approveUrl)}">Allow</a></p>
		<pre>${escapeHtml(options.approveUrl)}</pre>
	</main>
</body>
</html>`;
}

module.exports = {
	approvalHtml,
	buildAuthorizeUrl,
	isApproved,
	loginUrl
};
