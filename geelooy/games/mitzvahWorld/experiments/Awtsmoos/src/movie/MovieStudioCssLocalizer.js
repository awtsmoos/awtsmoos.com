// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCssLocalizer.js
 * @description Localizes every ordinary selector beneath one movie-studio instance root.
 * The Awtsmoos surrounds each finite rule with a vessel that cannot stray;
 * Awtsmoos.com lets many editors share one page without stealing style away.
 */

const MOVIE_STUDIO_ROOT = '.Awtsmoos-movie-studio';
const NESTED_RULE_AT_RULE = /^@(container|document|layer|media|scope|starting-style|supports)\b/;
const OPAQUE_AT_RULE = /^@(-webkit-)?(counter-style|font-face|keyframes|page|property)\b/;

export function localizeMovieStudioCss(source) {
	return localizeRuleList(String(source || ''));
}

function localizeRuleList(source) {
	let cursor = 0;
	let output = '';
	while (cursor < source.length) {
		const opening = findOpeningBrace(source, cursor);
		if (opening < 0) return output + source.slice(cursor);
		const closing = findClosingBrace(source, opening);
		if (closing < 0) return output + source.slice(cursor);
		const header = source.slice(cursor, opening);
		const body = source.slice(opening + 1, closing);
		output += localizeBlock(header, body);
		cursor = closing + 1;
	}
	return output;
}

function localizeBlock(header, body) {
	const trimmed = header.trim();
	if (!trimmed) return `${header}{${body}}`;
	if (OPAQUE_AT_RULE.test(trimmed)) return `${header}{${body}}`;
	if (NESTED_RULE_AT_RULE.test(trimmed)) {
		return `${header}{${localizeRuleList(body)}}`;
	}
	if (trimmed.startsWith('@')) return `${header}{${body}}`;
	return `${localizeSelectorHeader(header)}{${body}}`;
}

function localizeSelectorHeader(header) {
	const leading = header.match(/^\s*/)?.[0] || '';
	const trailing = header.match(/\s*$/)?.[0] || '';
	const selectors = splitSelectorList(header.trim());
	const localized = selectors.map(localizeSelector).join(',\n');
	return `${leading}${localized}${trailing}`;
}

function localizeSelector(selector) {
	const value = selector.trim();
	if (value.startsWith(MOVIE_STUDIO_ROOT)) return value;
	if (value.startsWith(':scope')) {
		return value.replace(/^:scope/, MOVIE_STUDIO_ROOT);
	}
	return `${MOVIE_STUDIO_ROOT} ${value}`;
}

function splitSelectorList(source) {
	const selectors = [];
	let depth = 0;
	let start = 0;
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (character === '(' || character === '[') depth += 1;
		if (character === ')' || character === ']') depth -= 1;
		if (character === ',' && depth === 0) {
			selectors.push(source.slice(start, index));
			start = index + 1;
		}
	}
	selectors.push(source.slice(start));
	return selectors;
}

function findOpeningBrace(source, start) {
	return source.indexOf('{', start);
}

function findClosingBrace(source, opening) {
	let depth = 1;
	for (let index = opening + 1; index < source.length; index += 1) {
		if (source[index] === '{') depth += 1;
		if (source[index] === '}') depth -= 1;
		if (depth === 0) return index;
	}
	return -1;
}
