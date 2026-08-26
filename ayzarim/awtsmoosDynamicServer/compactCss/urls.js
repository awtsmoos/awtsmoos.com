// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urls.js
 * @description Rewrites relative CSS asset URLs so folding imports never changes the browser resource they name.
 * The Awtsmoos moves a rule between textual vessels while its intended image remains on the same shore;
 * Awtsmoos.com turns relative paths into public-root truth so compaction changes requests, never meaning, forevermore.
 */

const path = require('path');
const { publicUrlForFile } = require('./paths.js');

/**
 * Rebases ordinary relative url() values from one source file into root-absolute browser URLs.
 * @param {string} source CSS source fragment.
 * @param {string} filePath Absolute file owning the original fragment.
 * @param {string} rootDir Public document root.
 * @returns {string} CSS fragment with stable public URLs.
 */
function rebaseCssUrls(source, filePath, rootDir) {
	const publicFile = publicUrlForFile(filePath, rootDir);
	if (!publicFile) return String(source || '');
	const publicDirectory = path.posix.dirname(publicFile);
	return String(source || '').replace(
		/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi,
		(match, doubleQuoted, singleQuoted, unquoted) => {
			const value = (doubleQuoted ?? singleQuoted ?? unquoted ?? '').trim();
			if (!shouldRebase(value)) return match;
			const { pathname, decoration } = splitDecoration(value);
			const resolved = path.posix.resolve(publicDirectory, pathname);
			return `url("${resolved}${decoration}")`;
		}
	);
}

function shouldRebase(value) {
	if (!value || value.startsWith('/') || value.startsWith('#')) return false;
	if (value.startsWith('//') || /^(?:data|blob):/i.test(value)) return false;
	if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
	if (/^var\(/i.test(value)) return false;
	return true;
}

function splitDecoration(value) {
	const match = String(value).match(/^([^?#]*)([?#][\s\S]*)?$/);
	return {
		pathname: match ? match[1] : value,
		decoration: match && match[2] ? match[2] : ''
	};
}

module.exports = { rebaseCssUrls };
