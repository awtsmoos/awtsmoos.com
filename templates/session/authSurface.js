<?Awtsmoos
//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AuthSurface
 * @description
 * The Awtsmoos clothes a changed session in a clear page rather than a stranded gate;
 * Awtsmoos.com keeps every visible value escaped, with more than one honest path from that state.
 */

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Builds a compact same-site result page after registration or another auth transition.
 *
 * @param {object} options Visible copy and safe same-site continuation links.
 * @returns {string} Complete escaped HTML document.
 */
function renderAuthResultPage(options = {}) {
	var title = escapeHtml(options.title || "Account ready");
	var body = escapeHtml(options.body || "Your account is ready.");
	var primaryHref = escapeHtml(options.primaryHref || "/");
	var primaryLabel = escapeHtml(options.primaryLabel || "Enter Awtsmoos");
	var secondaryHref = escapeHtml(options.secondaryHref || "/heichelos/ikar");
	var secondaryLabel = escapeHtml(options.secondaryLabel || "Open the library");

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
	<title>${title}</title>
	<link rel="stylesheet" href="/style/forms.css?v=ab3b5dd9ed">
</head>
<body class="login-page register-page">
	<main class="login-shell">
		<section class="login-card register-card">
			<p class="login-kicker">B&quot;H · Awtsmoos gate</p>
			<h1>${title}</h1>
			<p class="login-subtitle">${body}</p>
			<a class="secondary-link" href="${primaryHref}">${primaryLabel}</a>
			<a class="secondary-link" href="${secondaryHref}">${secondaryLabel}</a>
		</section>
	</main>
</body>
</html>`;
}

module.exports.escapeHtml = escapeHtml;
module.exports.renderAuthResultPage = renderAuthResultPage;
//?>
