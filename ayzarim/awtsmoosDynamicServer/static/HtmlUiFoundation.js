//B"H
//Boruch Hashem
//Blessed is He

const { compactHtmlModuleScripts } = require("./HtmlCompactModules.js");
const { compactHtmlStylesheets } = require("./HtmlCompactStylesheets.js");

/**
 * @module HtmlUiFoundation
 * @description The Awtsmoos lets every complete Awtsmoos.com document receive one quiet UI foundation;
 * local module and stylesheet doors also enter compact transport here, so authored pages gain speed without per-page drift.
 */

const FOUNDATION_MARKER = "data-awtsmoos-ui-foundation";
const RAW_MARKER = "data-g-ui-raw";
const FOUNDATION_VERSION = "universal-ui-006";
const FOUNDATION_STYLE = `/style/universal-ui.css?v=${FOUNDATION_VERSION}&compact=true`;
const FOUNDATION_SCRIPT = `/scripts/awtsmoos/ui/foundation.js?v=${FOUNDATION_VERSION}&compact=true`;

/** Injects compact asset transport and one version-matched UI pair into a complete HTML document. */
function revealHtmlUiFoundation(content, context = null) {
	if (typeof content !== "string") {
		return content;
	}
	if (!isCompleteHtmlDocument(content) || content.includes(RAW_MARKER)) {
		return content;
	}
	const compactedModules = compactHtmlModuleScripts(content);
	const compacted = compactHtmlStylesheets(compactedModules, context);
	if (compacted.includes(FOUNDATION_MARKER)) {
		return compacted;
	}
	const closingHead = compacted.search(/<\/head\s*>/i);
	if (closingHead < 0) {
		return compacted;
	}
	const vessels = [
		`<link rel="stylesheet" href="${FOUNDATION_STYLE}" ${FOUNDATION_MARKER}="style">`,
		`<script type="module" src="${FOUNDATION_SCRIPT}" ${FOUNDATION_MARKER}="script"></script>`
	].join("\n\t");
	return `${compacted.slice(0, closingHead)}\t${vessels}\n${compacted.slice(closingHead)}`;
}

function isCompleteHtmlDocument(content) {
	const start = withoutLeadingComments(content).slice(0, 48).toLowerCase();
	return start.startsWith("<!doctype html") || start.startsWith("<html");
}

function withoutLeadingComments(content) {
	let remainder = content.trimStart();
	while (remainder.startsWith("<!--")) {
		const end = remainder.indexOf("-->");
		if (end < 0) {
			break;
		}
		remainder = remainder.slice(end + 3).trimStart();
	}
	return remainder;
}

module.exports = {
	isCompleteHtmlDocument,
	revealHtmlUiFoundation
};
