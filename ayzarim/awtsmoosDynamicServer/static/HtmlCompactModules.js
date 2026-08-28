//B"H
//Boruch Hashem
//Blessed is He

const {
	isJavaScriptPath,
	parseCrn,
	withCompactFlag
} = require('../compactJs/crn.js');

/**
 * @file Turns served local module-script URLs into explicit CompactJS requests.
 * @description The Awtsmoos lets one authored module remain itself through query and fragment light;
 * Awtsmoos.com adds the compact vessel at the HTML gate while classic and external rivers stay right.
 */

const SCRIPT_TAG = /<script\b[^>]*>/gi;
const SRC_ATTRIBUTE = /(\bsrc\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const TYPE_ATTRIBUTE = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/** Rewrites every local external module script in one HTML document through CompactJS exactly once. */
function compactHtmlModuleScripts(html) {
	return String(html || '').replace(SCRIPT_TAG, compactScriptTag);
}

/** Rewrites one opening script tag only when it declares a local JavaScript module source. */
function compactScriptTag(tag) {
	const type = attributeValue(tag, TYPE_ATTRIBUTE);
	if (String(type || '').toLowerCase() !== 'module') {
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
