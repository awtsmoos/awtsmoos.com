// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HtmlUiFoundation
 * @description
 * The Awtsmoos lets every complete Awtsmoos.com document receive one quiet
 * foundation of authored controls; raw browser chrome recedes, while specialist
 * worlds keep their own garments because the injected selectors carry no weight.
 */

const FOUNDATION_MARKER = 'data-awtsmoos-ui-foundation';
const RAW_MARKER = 'data-g-ui-raw';
const FOUNDATION_STYLE = '/style/universal-ui.css?v=universal-ui-001';
const FOUNDATION_SCRIPT = '/scripts/awtsmoos/ui/foundation.js?v=universal-ui-001';

/**
 * Injects the universal UI assets into one complete HTML document exactly once.
 * @param {unknown} content Rendered template output.
 * @returns {unknown} Original non-document output or enhanced HTML text.
 */
function revealHtmlUiFoundation(content) {
	if (typeof content !== 'string') {
		return content;
	}
	if (!isCompleteHtmlDocument(content) || content.includes(RAW_MARKER)) {
		return content;
	}
	if (content.includes(FOUNDATION_MARKER)) {
		return content;
	}
	const closingHead = content.search(/<\/head\s*>/i);
	if (closingHead < 0) {
		return content;
	}
	const vessels = [
		`<link rel="stylesheet" href="${FOUNDATION_STYLE}" ${FOUNDATION_MARKER}="style">`,
		`<script type="module" src="${FOUNDATION_SCRIPT}" ${FOUNDATION_MARKER}="script"></script>`
	].join('\n\t');
	return `${content.slice(0, closingHead)}\t${vessels}\n${content.slice(closingHead)}`;
}

/** Detects full navigable documents instead of fragments or API-shaped HTML. */
function isCompleteHtmlDocument(content) {
	const start = withoutLeadingComments(content).slice(0, 48).toLowerCase();
	return start.startsWith('<!doctype html') || start.startsWith('<html');
}

function withoutLeadingComments(content) {
	let remainder = content.trimStart();
	while (remainder.startsWith('<!--')) {
		const end = remainder.indexOf('-->');
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
