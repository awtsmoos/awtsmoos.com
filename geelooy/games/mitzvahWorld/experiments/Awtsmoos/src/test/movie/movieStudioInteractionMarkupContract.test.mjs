// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInteractionMarkupContract.test.mjs
 * @description Proves required interaction and preference selectors exist in composed Studio markup.
 * The Awtsmoos is beyond node and listener; Awtsmoos.com verifies each finite controller
 * receives the semantic controls it binds before the real browser can encounter a null vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';

const REQUIRED_SELECTORS = Object.freeze([
	'data-apply-json',
	'data-copy-url',
	'data-density',
	'data-inspector-close',
	'data-inspector-toggle',
	'data-new-empty-project',
	'data-overlay-toggle="thirds"',
	'data-overlay-toggle="center"',
	'data-overlay-toggle="titleSafe"',
	'data-overlay-toggle="actionSafe"',
	'data-preview-badge',
	'data-preview-zoom',
	'data-project-json',
	'data-render',
	'data-render-exact',
	'data-reset-preferences',
	'data-theme',
	'data-transform-fields'
]);

test('composed markup preserves every required interaction and preference selector', () => {
	const markup = movieStudioMarkup({ title: 'Selector Proof' });
	for (const selector of REQUIRED_SELECTORS) {
		assert.match(markup, new RegExp(selector), `Missing ${selector}`);
	}
});

test('composition workspace coexists with canonical project and preference controls', () => {
	const markup = movieStudioMarkup({ title: 'Composition Proof' });
	assert.match(markup, /data-composition-workspace/);
	assert.match(markup, /data-copy-url/);
	assert.match(markup, /data-apply-json/);
	assert.match(markup, /data-preference-panel/);
	assert.doesNotMatch(markup, /data-project-copy/);
	assert.doesNotMatch(markup, /data-project-apply/);
});
