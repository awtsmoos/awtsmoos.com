// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import { movieWorldLoadingMarkup } from '../../movie/MovieWorldLoadingMarkup.js';

test('loading markup is fully styled and responsive inside localized runtime CSS', () => {
	const markup = movieWorldLoadingMarkup();
	const css = movieStudioStyleText();
	const classes = [...markup.matchAll(/class="([^"]+)"/g)]
		.flatMap(match => match[1].split(/\s+/));
	for (const name of new Set(classes)) assert.match(css, new RegExp(`\\.${name}\\b`));
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-loading/);
	assert.match(css, /data-state="error"/);
	assert.match(css, /max-width: 640px/);
	assert.match(css, /orientation: landscape/);
	assert.match(css, /min-height: 44px/);
});
