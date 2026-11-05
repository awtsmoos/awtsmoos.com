// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioCinemaMarkupCss.test.mjs
 * @description Proves the live 3D monitor preserves controls, compact editing, viewport-bound focus, and touch-safe exit geometry.
 * The Awtsmoos renews world and tool without confusion; Awtsmoos.com verifies the canvas leads,
 * focus owns explicit viewport measure, and every small-screen hand retains a forty-four-pixel door.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioCinemaFocusCss } from '../../movie/MovieStudioCinemaFocusCss.js';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

const REQUIRED_SELECTORS = Object.freeze([
	'data-focus-3d',
	'data-timeline-toggle',
	'data-live-3d-state',
	'data-preview',
	'data-play',
	'data-pause',
	'data-render',
	'data-render-exact',
	'data-inspector-toggle',
	'data-command-search',
	'data-project-json',
	'data-apply-json'
]);

test('cinema-first markup preserves every essential and legacy control', () => {
	const markup = movieStudioMarkup({
		duration: 12,
		fps: 24,
		resolution: { height: 1080, width: 1920 },
		title: 'Living World'
	});
	for (const selector of REQUIRED_SELECTORS) {
		assert.match(markup, new RegExp(selector), selector);
	}
	assert.match(markup, /Starting the real 3D world/);
	assert.match(markup, /<details class="movie-studio-more-actions">/);
});

test('cinema CSS makes the monitor dominant and tools reversible', () => {
	const css = movieStudioStyleText();
	for (const token of [
		'--movie-timeline-compact-height: 112px',
		'.is-timeline-expanded',
		'.is-cinema-focus',
		'.movie-cinema-live-badge',
		'.movie-studio-preview > canvas'
	]) {
		assert.equal(css.includes(token), true, token);
	}
});

test('focus CSS escapes inherited grid height and protects the mobile exit target', () => {
	const css = movieStudioCinemaFocusCss().replace(/\s+/g, ' ');
	assert.match(css, /\.is-cinema-focus \.movie-studio-workspace .*position: absolute.*inset: 0.*display: block.*height: 100dvh/);
	assert.match(css, /\.is-cinema-focus \.movie-studio-preview-column .*position: absolute.*inset: 0.*height: 100dvh/);
	assert.match(css, /\.is-cinema-focus \.movie-studio-preview-stage .*position: absolute.*inset: 0.*height: 100dvh/);
	assert.match(css, /\.is-cinema-focus \.movie-studio-preview-frame .*width: min\(100vw, calc\(100dvh \* var\(--movie-project-aspect, 1\.7778\)\)\).*height: min\(100dvh, calc\(100vw \/ var\(--movie-project-aspect, 1\.7778\)\)\)/);
	assert.match(css, /@media \(max-width: 640px\).*\[data-focus-3d\].*min-width: 44px.*min-height: 44px/);
});
