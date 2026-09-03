//B"H
// Boruch Hashem
// Blessed is He

const {
	isJavaScriptPath,
	parseCrn,
	withCompactFlag
} = require('../compactJs/crn.js');

/**
 * @file HtmlCompactModules.js
 * @description Turns served local module-script URLs into CompactJS requests unless the author explicitly keeps one bootstrap raw.
 * The Awtsmoos lets ordinary modules enter the compact vessel while a deliberate first-light gate may remain sovereign and small;
 * Awtsmoos.com preserves the platform default, yet honors `data-awtsmoos-no-compact` when startup must not be swallowed by the whole graph at all.
 */
const SCRIPT_TAG = /<script\b[^>]*>/gi;
const SRC_ATTRIBUTE = /(\bsrc\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const TYPE_ATTRIBUTE = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const NO_COMPACT_ATTRIBUTE = /\bdata-awtsmoos-no-compact\b/i;

/** Rewrites every eligible local external module script in one HTML document through CompactJS exactly once. */
function compactHtmlModuleScripts(html) {
	return String(html || '').replace(SCRIPT_TAG, compactScriptTag);
}

/** Rewrites one module-script tag unless its author explicitly requests raw browser ESM. */
function compactScriptTag(tag) {
	const type = attributeValue(tag, TYPE_ATTRIBUTE);
	if (String(type || '').toLowerCase() !== 'module') {
		return tag;
	}
	if (NO_COMPACT_ATTRIBUTE.test(tag)) {
		return tag;
	}
	return tag.replace(SRC_ATTRIBUTE, (whole, prefix, doubleQuoted, singleQuoted, bare) => {
		const current = doubleQuoted ?? singleQuoted ?? bare;
		const compacted = compactBrowserModuleSource(current);
		if (compacted === current) {
			return whole;
		}
		const quote = doubleQuoted !== undefined ? '"' : singleQuoted !== undefined ? "'" : '';
		return `${prefix}${quote}${compacted}${quote}`;
	});
}

/** Adds compact=true to local script URLs, including browser-relative bare paths such as js/app.js. */
function compactBrowserModuleSource(source) {
	const value = String(source || '');
	const crn = parseCrn(value);
	if (crn.kind === 'bare') {
		if (!isJavaScriptPath(crn.pathname)) {
			return value;
		}
		const decorated = withCompactFlag(`./${value}`);
		return decorated.startsWith('./') ? decorated.slice(2) : decorated;
	}
	return withCompactFlag(value);
}

/** Reads one quoted or unquoted HTML attribute value without changing surrounding tag spelling. */
function attributeValue(tag, pattern) {
	const match = String(tag || '').match(pattern);
	return match ? match[1] ?? match[2] ?? match[3] ?? '' : '';
}

module.exports = {
	compactBrowserModuleSource,
	compactHtmlModuleScripts,
	compactScriptTag
};
