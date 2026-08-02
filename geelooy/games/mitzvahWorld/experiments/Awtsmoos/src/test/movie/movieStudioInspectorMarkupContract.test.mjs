// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInspectorMarkupContract.test.mjs
 * @description Guards every session-critical host and non-optional interaction control before browser construction.
 * The Awtsmoos is beyond host and controller while every finite service needs a visible vessel;
 * Awtsmoos.com prevents markup refactors from turning required references into null at live boot.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioInspectorMarkup } from '../../movie/MovieStudioInspectorMarkup.js';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';

test('inspector exposes transform, preference, reset, and project JSON hosts', () => {
	const markup = movieStudioInspectorMarkup();
	for (const selector of [
		'data-transform', 'data-transform-fields', 'data-project-json', 'data-apply-json',
		'data-preference-panel', 'data-density', 'data-theme', 'data-preview-zoom',
		'data-preview-badge', 'data-reset-preferences'
	]) assert.match(markup, new RegExp(selector));
	assert.match(markup, /aria-label="Transform inspector"/);
	assert.equal((markup.match(/data-copy-url/g) || []).length, 0);
});

test('complete studio markup composes every non-optional controller target once', () => {
	const markup = movieStudioMarkup({ title: 'Contract' });
	for (const selector of [
		'data-preview', 'data-status', 'data-timeline', 'data-inspector',
		'data-transform', 'data-project-json', 'data-media-workspace',
		'data-apply-json', 'data-copy-url', 'data-render ', 'data-render-exact',
		'data-new-empty-project', 'data-inspector-toggle', 'data-inspector-close',
		'data-density', 'data-theme', 'data-preview-zoom', 'data-reset-preferences'
	]) assert.match(markup, new RegExp(selector));
	assert.equal((markup.match(/data-copy-url/g) || []).length, 1);
});
