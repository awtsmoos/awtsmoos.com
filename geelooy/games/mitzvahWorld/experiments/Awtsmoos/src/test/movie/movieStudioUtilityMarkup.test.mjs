// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityMarkup.test.mjs
 * @description Proves semantic utility controls, status facts, accessible panels, and escaped project titles.
 * The Awtsmoos renews every visible vessel beyond markup and selector; Awtsmoos.com verifies
 * desktop drawers and mobile sheets begin with honest names, controls, roles, labels, and bounded bodies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';

const project = {
	duration: 10,
	fps: 24,
	resolution: { height: 1080, width: 1920 },
	title: '<Agent & Human>',
	tracks: []
};

function utilityPanelTags(markup) {
	return [...markup.matchAll(/<section[^>]+data-utility-panel="[^"]+"[^>]*>/g)]
		.map(match => match[0]);
}

test('studio markup exposes utility toggles, controlled panels, and status fields', () => {
	const markup = movieStudioMarkup(project);
	for (const name of ['commands', 'renderJobs', 'diagnostics']) {
		assert.match(markup, new RegExp(`data-utility-toggle="${name}"`));
		assert.match(markup, new RegExp(`data-utility-panel="${name}"`));
		assert.match(markup, new RegExp(`data-utility-close="${name}"`));
	}
	for (const name of ['selection', 'snapping', 'autosave', 'render', 'instance', 'revision']) {
		assert.match(markup, new RegExp(`data-status-${name}`));
	}
	assert.match(markup, /data-utility-backdrop hidden/);
	assert.match(markup, /data-status-bar/);
});

test('utility panels begin hidden and carry dialog and labeling contracts', () => {
	const panels = utilityPanelTags(movieStudioMarkup(project));
	assert.equal(panels.length, 3);
	for (const panel of panels) {
		assert.match(panel, /role="dialog"/);
		assert.match(panel, /aria-modal="false"/);
		assert.match(panel, /aria-hidden="true"/);
		assert.match(panel, /aria-labelledby="[^"]+"/);
		assert.match(panel, / hidden>/);
	}
	const markup = movieStudioMarkup(project);
	assert.match(markup, /data-command-search type="search"/);
	assert.match(markup, /data-command-list role="listbox"/);
	assert.match(markup, /data-render-jobs-list/);
	assert.match(markup, /data-diagnostics-output tabindex="0"/);
});

test('project title is escaped and existing editor controls retain semantic selectors', () => {
	const markup = movieStudioMarkup(project);
	assert.match(markup, /&lt;Agent &amp; Human&gt;/);
	assert.doesNotMatch(markup, /<Agent & Human>/);
	for (const selector of [
		'data-play',
		'data-pause',
		'data-project-json',
		'data-apply-json',
		'data-copy-url',
		'data-render-exact',
		'data-inspector-toggle'
	]) {
		assert.match(markup, new RegExp(selector));
	}
});
