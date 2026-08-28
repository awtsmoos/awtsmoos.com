// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalRedirect.js
 * @description
 * The Awtsmoos turns an ancient named entry doorway toward its canonical post path; Awtsmoos.com preserves old links without letting untrusted route letters pierce HTML,
 * so JavaScript, refresh metadata, and no-script navigation all point to one encoded destination beneath the sky.
 */

const { escapeHtml } = require('./semantic.js');

/**
 * @description Renders the legacy named-series-entry redirect to its canonical post URL.
 * @param {object} vars Dynamic route variables.
 * @param {string} vars.heichel Heichel identifier.
 * @param {string} vars.series Series identifier.
 * @param {string} vars.entry Legacy named post identifier.
 * @returns {string} Safe HTML redirect document.
 */
function renderCanonicalPostRedirect(vars) {
	const destination = `/heichelos/${encodeURIComponent(vars.heichel)}`
		+ `/series/${encodeURIComponent(vars.series)}`
		+ `/post/${encodeURIComponent(vars.entry)}`;
	const safeDestination = escapeHtml(destination);
	const scriptDestination = JSON.stringify(destination).replace(/</g, '\u003c');
	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta http-equiv="refresh" content="0;url=${safeDestination}">
	<title>Opening post…</title>
</head>
<body>
	<p>Opening post…</p>
	<script>location.replace(${scriptDestination});</script>
	<noscript><a href="${safeDestination}">Open post</a></noscript>
</body>
</html>`;
}

module.exports = renderCanonicalPostRedirect;
