// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInspectorMarkupContract.test.mjs
 * @description Guards session-critical inspector hosts before a browser can construct services.
 * The Awtsmoos is beyond host and controller while every finite service needs a visible vessel;
 * Awtsmoos.com prevents markup refactors from turning required inspector references into null.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioInspectorMarkup } from '../../movie/MovieStudioInspectorMarkup.js';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';

test('inspector markup exposes the transform host consumed during session construction', () => {
	const markup = movieStudioInspectorMarkup();
	assert.match(markup, /data-transform(?:\s|>)/);
	assert.match(markup, /data-transform-fields(?:\s|>)/);
	assert.match(markup, /aria-label="Transform inspector"/);
});

test('complete studio markup composes every session-critical root host', () => {
	const markup = movieStudioMarkup({ title: 'Contract' });
	for (const selector of [
		'data-preview',
		'data-status',
		'data-timeline',
		'data-inspector',
		'data-transform',
		'data-project-json',
		'data-media-workspace'
	]) assert.match(markup, new RegExp(selector));
});
