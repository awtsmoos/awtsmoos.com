// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineAppearanceCss.test.mjs
 * @description Proves timeline appearance markup, data, localization, overview, and mobile styling contracts.
 * The Awtsmoos is beyond badge and wedge while each finite appearance must remain visible and named;
 * Awtsmoos.com verifies transition, effect, and keyframe evidence is localized, responsive, and contained.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import {
	applyMovieTimelineAppearanceData,
	movieTimelineAppearanceMarkup
} from '../../movie/MovieTimelineAppearanceMarkup.js';

function clip() {
	return {
		effects: [
			{ id: 'blur', keyframes: [{ time: 0, value: 0 }], kind: 'blur' },
			{ id: 'opacity', keyframes: [], kind: 'opacity' }
		],
		transitionIn: { duration: 1, type: 'fade' },
		transitionOut: { duration: 1, type: 'dissolve' }
	};
}

test('appearance markup exposes accessible transition, effect, and keyframe evidence', () => {
	const markup = movieTimelineAppearanceMarkup(clip());
	assert.match(markup, /transition in, transition out, 2 effects, 1 keyframe/);
	assert.match(markup, /movie-clip-transition-in/);
	assert.match(markup, /movie-clip-transition-out/);
	assert.match(markup, /fx 2/);
	assert.match(markup, /◆ 1/);
	const element = { dataset: {} };
	applyMovieTimelineAppearanceData(element, clip());
	assert.deepEqual(element.dataset, {
		hasEffects: 'true',
		hasKeyframes: 'true',
		transitionIn: 'true',
		transitionOut: 'true'
	});
});

test('runtime CSS localizes appearance badges, transitions, overview, and mobile contracts', () => {
	const css = movieStudioStyleText().replace(/\s+/g, ' ');
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-clip-appearance/);
	assert.match(css, /\.movie-clip-transition-in/);
	assert.match(css, /\.movie-clip-transition-out/);
	assert.match(css, /data-has-effects="true"/);
	assert.match(css, /data-has-keyframes="true"/);
	assert.match(css, /data-scale-band="overview".*movie-clip-effect-count/);
	assert.match(css, /@media \(max-width: 640px\).*movie-clip-keyframe-count/);
});
