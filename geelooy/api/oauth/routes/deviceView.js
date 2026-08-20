// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human-facing verification pages for Awtsmoos.com device authorization.
 * @description
 * The Awtsmoos lets the person see exactly the short code, requesting client,
 * scopes, and decision while keeping the daemon's machine code and every token
 * outside the browser garment entirely.
 */

const { escapeHtml } = require("../tools/respond.js");
const { fullUrlFor } = require("../tools/urls.js");
const { deviceStyles } = require("./deviceStyles.js");

function shell(title, body) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="referrer" content="no-referrer">
	<title>${escapeHtml(title)}</title>
	<style>${deviceStyles()}</style>
</head>
<body>
	<main>${body}</main>
</body>
</html>`;
}

function entryPage(options = {}) {
	const notice = options.message
		? `<p class="notice ${options.error ? "error" : ""}">${escapeHtml(options.message)}</p>`
		: "";
	return shell("Awtsmoos Device Authorization", `
		<h1>B&quot;H Connect an AI Device</h1>
		<p>Enter the short code shown by your AI client.</p>
		${notice}
		<form method="get" action="/api/oauth/device">
			<label for="user_code">Device code</label>
			<input id="user_code" name="user_code" autocomplete="one-time-code" value="${escapeHtml(options.userCode || "")}" placeholder="ABCD-EFGH" required>
			<div class="actions"><button class="approve" type="submit">Continue</button></div>
		</form>
	`);
}

function reviewPage(options) {
	return shell("Approve AI Device", `
		<h1>B&quot;H Approve This AI?</h1>
		<p>Confirm that this is the same code shown by your AI client.</p>
		<div class="user-code">${escapeHtml(options.userCode)}</div>
		<p><strong>Client:</strong> ${escapeHtml(options.client.name)}</p>
		<p><strong>Signed in as:</strong> <code>${escapeHtml(options.userId)}</code></p>
		<p><strong>Scopes:</strong> <code>${escapeHtml(options.scope)}</code></p>
		<div class="notice">Only approve if you initiated this connection. The browser never receives the machine device code or OAuth tokens.</div>
		<div class="actions">
			<form method="post" action="/api/oauth/device">
				<input type="hidden" name="user_code" value="${escapeHtml(options.userCode)}">
				<input type="hidden" name="decision" value="approve">
				<button class="approve" type="submit">Approve</button>
			</form>
			<form method="post" action="/api/oauth/device">
				<input type="hidden" name="user_code" value="${escapeHtml(options.userCode)}">
				<input type="hidden" name="decision" value="deny">
				<button class="deny" type="submit">Deny</button>
			</form>
		</div>
	`);
}

function resultPage(approved) {
	return shell(
		approved ? "Device Approved" : "Device Denied",
		`<h1>B&quot;H ${approved ? "Device Approved" : "Device Denied"}</h1>
		<p>${approved
			? "You may return to the AI client. It can now complete token polling."
			: "This device request was denied. It cannot receive a token from this authorization."}</p>`
	);
}

function loginUrl($i, userCode) {
	const next = fullUrlFor($i, "/api/oauth/device", {
		user_code: userCode
	});
	return fullUrlFor($i, "/login/", { next });
}

module.exports = {
	entryPage,
	loginUrl,
	resultPage,
	reviewPage,
	shell
};
