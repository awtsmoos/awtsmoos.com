//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond document, head, body, and comparison while every static embed receives one complete lawful vessel;
 * Awtsmoos.com joins semantic markup, multi-opinion tables, and self-contained CSS so server Zmanim can stand without script or wrestle.
 */

const { renderComparisonMarkup } = require("./embedComparisonMarkup.js");
const { embedComparisonStyles } = require("./embedComparisonStyles.js");
const { embedStyles } = require("./embedStyles.js");
const { escapeHtml } = require("./htmlEscape.js");
const { renderEmbedMarkup } = require("./embedMarkup.js");

/** Compose one standalone server-rendered Zmanim HTML document. */
function renderEmbedDocument(day, presentation, interactiveHref, now = Date.now(), comparison = null) {
	const title = `${day.location.label || "Zmanim"} · ${day.date}`;
	const bodyClass = [
		`theme-${presentation.theme}`,
		`density-${presentation.density}`,
		`view-${presentation.view}`
	].join(" ");
	const comparisonMarkup = renderComparisonMarkup(comparison, presentation);
	const markup = renderEmbedMarkup(day, presentation, interactiveHref, now, comparisonMarkup);
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="color-scheme" content="dark light">
	<title>${escapeHtml(title)}</title>
	<style>${embedStyles()}${embedComparisonStyles()}</style>
</head>
<body class="${escapeHtml(bodyClass)}">
	<main>${markup}</main>
</body>
</html>`;
}

module.exports = {
	renderEmbedDocument
};
