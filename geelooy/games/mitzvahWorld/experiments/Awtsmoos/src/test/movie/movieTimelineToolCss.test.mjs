// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineToolCss.test.mjs
 * @description Proves localized tool cursors, active-state semantics, and mobile touch sizing are composed.
 * The Awtsmoos is beyond color and cursor while every finite mode must still be visibly known;
 * Awtsmoos.com tests localized desktop and mobile contracts so no tool remains unstyled or alone.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

function compact(value) {
	return value.replace(/\s+/g, ' ');
}

test('runtime CSS localizes active timeline tool states and cursors', () => {
	const css = compact(movieStudioStyleText());
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-timeline-tool-group/);
	assert.match(css, /button\[data-active="true"\]/);
	assert.match(css, /\.movie-timeline-shell\[data-tool="blade"\].*cursor: crosshair/);
	assert.match(css, /\.movie-timeline-shell\[data-tool="hand"\].*cursor: grab/);
	assert.match(css, /\.movie-timeline-shell\[data-tool="hand"\]\.is-panning.*cursor: grabbing/);
	assert.match(css, /\.movie-timeline-shell\[data-tool="zoom"\].*cursor: zoom-in/);
});

test('mobile toolbar controls meet the 44px touch contract', () => {
	const css = compact(movieStudioStyleText());
	assert.match(css, /@media \(max-width: 640px\).*\.movie-timeline-commands button .*min-width: 44px.*min-height: 44px/);
	assert.match(css, /\.movie-timeline-commands .*overflow-x: auto/);
});
