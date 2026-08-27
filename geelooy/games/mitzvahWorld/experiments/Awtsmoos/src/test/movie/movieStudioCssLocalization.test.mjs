// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioCssLocalization.test.mjs
 * @description Proves selector isolation, theme composition, responsive nesting, and static markup coverage.
 * The Awtsmoos binds each rule to its studio while every control receives a name;
 * Awtsmoos.com prevents style collision without leaving one visible vessel plain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { localizeMovieStudioCss } from '../../movie/MovieStudioCssLocalizer.js';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

const ROOT = '.Awtsmoos-movie-studio';

test('localizer scopes selector lists and nested conditional rules', () => {
	const localized = localizeMovieStudioCss(`
		.alpha, .beta:is(.one, .two) { color: red; }
		@media (max-width: 700px) { .gamma { display: block; } }
		${ROOT}[data-theme="light"] { color: black; }
	`);
	assert.match(localized, /\.Awtsmoos-movie-studio \.alpha/);
	assert.match(localized, /\.Awtsmoos-movie-studio \.beta:is\(\.one, \.two\)/);
	assert.match(localized, /@media \(max-width: 700px\).*\.Awtsmoos-movie-studio \.gamma/s);
	assert.doesNotMatch(localized, new RegExp(`${escapeRegex(ROOT)} ${escapeRegex(ROOT)}`));
});

test('complete runtime stylesheet contains only localized ordinary selectors', () => {
	const selectors = collectSelectors(movieStudioStyleText());
	const leaked = selectors.filter(selector => !selector.startsWith(ROOT));
	assert.deepEqual(leaked, []);
});

test('runtime stylesheet composes all legacy themes and Santo semantic tokens', () => {
	const css = movieStudioStyleText();
	for (const theme of ['neutral-dark', 'light', 'high-contrast', 'santo']) {
		assert.match(css, new RegExp(`data-theme="${theme}"`));
	}
	assert.match(css, /data-theme="santo"[^{]*\{[^}]*--movie-accent: #f2ba63/s);
	assert.match(css, /@media \(max-width: 640px\)/);
	assert.match(css, /@media \(max-width: 720px\).*orientation: landscape/s);
});

test('every static class emitted by studio markup has a runtime style selector', () => {
	const markup = movieStudioMarkup({ title: 'Localized Studio' });
	const classes = [...markup.matchAll(/class="([^"]+)"/g)]
		.flatMap(match => match[1].split(/\s+/))
		.filter(Boolean);
	const css = movieStudioStyleText();
	const missing = [...new Set(classes)].filter(name => !css.includes(`.${name}`));
	assert.deepEqual(missing, []);
});

function collectSelectors(css) {
	const selectors = [];
	visitRules(css, selectors);
	return selectors;
}

function visitRules(css, selectors) {
	let cursor = 0;
	while (cursor < css.length) {
		const opening = css.indexOf('{', cursor);
		if (opening < 0) return;
		const closing = matchingBrace(css, opening);
		if (closing < 0) return;
		const header = css.slice(cursor, opening).trim();
		const body = css.slice(opening + 1, closing);
		if (/^@(media|supports|container|layer|document|scope|starting-style)\b/.test(header)) {
			visitRules(body, selectors);
		} else if (header && !header.startsWith('@')) {
			selectors.push(...header.split(',').map(value => value.trim()));
		}
		cursor = closing + 1;
	}
}

function matchingBrace(css, opening) {
	let depth = 1;
	for (let index = opening + 1; index < css.length; index += 1) {
		if (css[index] === '{') depth += 1;
		if (css[index] === '}') depth -= 1;
		if (depth === 0) return index;
	}
	return -1;
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
