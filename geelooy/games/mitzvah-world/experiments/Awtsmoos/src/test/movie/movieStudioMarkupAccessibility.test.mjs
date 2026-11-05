// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioMarkup } from '../../movie/MovieStudioMarkup.js';

const project = {
	duration: 60,
	fps: 30,
	resolution: { width: 1920, height: 1080 },
	title: '<Village & Light>'
};

test('movie studio markup preserves real controller hooks and accessible landmarks', () => {
	const markup = movieStudioMarkup(project);
	for (const hook of [
		'data-preview', 'data-preview-frame', 'data-preview-badge', 'data-preview-zoom',
		'data-play', 'data-pause', 'data-transport-rate', 'data-transport-start',
		'data-transport-step-back', 'data-transport-shuttle-back',
		'data-transport-shuttle-forward', 'data-transport-step-forward', 'data-transport-end',
		'data-inspector-toggle', 'data-inspector', 'data-timeline', 'data-status', 'data-status-bar',
		'data-inspector-splitter', 'data-timeline-splitter'
	]) {
		assert.match(markup, new RegExp(hook));
	}
	assert.match(markup, /aria-label="Program monitor"/);
	assert.match(markup, /aria-label="Program playback controls"/);
	assert.match(markup, /role="separator"/);
	assert.match(markup, /&lt;Village &amp; Light&gt;/);
});
