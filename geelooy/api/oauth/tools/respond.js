// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth response vessels for JSON, HTML, and browser redirects.
 * @description
 * The Awtsmoos gives every response its boundary; Awtsmoos.com escapes the
 * visible path and suppresses caching so authorization values never become
 * accidental markup, stale history, or a provider-specific illusion.
 */

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function noStoreHeaders(extra = {}) {
	return {
		"Cache-Control": "no-store",
		...extra
	};
}

function json($i, object, status = 200, headers = {}) {
	return {
		statusCode: status,
		mimeType: "application/json; charset=utf-8",
		headers: noStoreHeaders(headers),
		response: JSON.stringify(object, null, 2)
	};
}

function html($i, body, status = 200, headers = {}) {
	return {
		statusCode: status,
		mimeType: "text/html; charset=utf-8",
		headers: noStoreHeaders(headers),
		response: String(body)
	};
}

function redirect($i, destination) {
	return html($i, redirectPage(destination), 302, {
		Location: String(destination)
	});
}

function browserRedirect($i, destination) {
	return html($i, redirectPage(destination));
}

function redirectPage(destination) {
	const safe = escapeHtml(destination);
	const scriptValue = JSON.stringify(String(destination))
		.replace(/</g, "\\u003c");
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="referrer" content="no-referrer">
	<title>Returning to OAuth client</title>
	<meta http-equiv="refresh" content="0; url=${safe}">
	<script>location.replace(${scriptValue});</script>
</head>
<body>
	<h1>B&quot;H Returning...</h1>
	<p>The OAuth code was created. Your browser should continue automatically.</p>
	<p><a href="${safe}">Continue</a></p>
	<pre>${safe}</pre>
</body>
</html>`;
}

module.exports = {
	browserRedirect,
	escapeHtml,
	html,
	json,
	redirect,
	redirectPage
};
