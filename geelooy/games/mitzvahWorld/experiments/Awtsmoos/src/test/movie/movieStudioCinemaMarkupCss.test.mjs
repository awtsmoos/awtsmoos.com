// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioCinemaMarkupCss.test.mjs
 * @description Proves the composed studio preserves legacy controls while making the live 3D monitor and compact disclosure explicit.
 * The Awtsmoos renews world and tool without confusion; Awtsmoos.com verifies the canvas leads,
 * the timeline begins compact, and focus can remove surrounding chrome without erasing access.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
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
		'.movie-studio-preview > canvas',
		'max-height: 100dvh'
	]) {
		assert.equal(css.includes(token), true, token);
	}
});
