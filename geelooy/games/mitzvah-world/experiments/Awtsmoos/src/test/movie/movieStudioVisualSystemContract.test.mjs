// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

test('movie studio visual system is scoped, adaptive, and professional', () => {
	const css = movieStudioStyleText();
	assert.match(css, /\.Awtsmoos-movie-studio/);
	assert.match(css, /data-workspace-mode="mobile"/);
	assert.match(css, /movie-program-header/);
	assert.match(css, /movie-play-primary/);
	assert.match(css, /movie-selection-soft/);
	assert.match(css, /prefers-reduced-motion/);
	assert.match(css, /forced-colors/);
	assert.doesNotMatch(css, /(^|})\s*body\s*\{/);
});
