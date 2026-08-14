// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookExportOptions
 * @description
 * The Awtsmoos gives every book request a measured vessel: language, recursion,
 * typography, and bounded traversal become explicit before a single page is read.
 */
const LANGUAGES = new Set(['english', 'original', 'bilingual']);
const SCOPES = new Set(['direct', 'nested']);
const MODES = new Set(['leaves', 'combined']);

function number(value, fallback) {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function boolean(value, fallback = false) {
	if (value === undefined || value === null || value === '') return fallback;
	return value === true || value === 'true' || value === '1' || value === 'yes';
}

function choice(value, allowed, fallback) {
	const normalized = String(value || '').trim().toLowerCase();
	return allowed.has(normalized) ? normalized : fallback;
}

function cleanTitle(value) {
	return String(value || '').replace(/[<>]/g, '').trim().slice(0, 180);
}

function parse(input = {}, defaults = {}) {
	const language = choice(input.language, LANGUAGES, defaults.language || 'bilingual');
	const scope = choice(input.scope, SCOPES, defaults.scope || 'direct');
	const mode = choice(input.mode, MODES, defaults.mode || 'leaves');
	const fontPt = Math.max(9, Math.min(18, number(input.fontPt, defaults.fontPt || 11.5)));
	return {
		language,
		scope,
		mode,
		fontPt,
		title: cleanTitle(input.title || defaults.title),
		includeEmpty: boolean(input.includeEmpty, defaults.includeEmpty || false),
		maxDepth: Math.max(1, Math.min(16, Math.trunc(number(input.maxDepth, 10)))),
		maxBooks: Math.max(1, Math.min(120, Math.trunc(number(input.maxBooks, 100)))),
		maxPosts: Math.max(1, Math.min(3000, Math.trunc(number(input.maxPosts, 2500))))
	};
}

function requestInput($i) {
	return {
		...($i.$_GET || {}),
		...($i.$_POST || {})
	};
}

module.exports = {
	LANGUAGES,
	MODES,
	SCOPES,
	parse,
	requestInput
};
