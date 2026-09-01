//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { GevurahH3Validator } = require('../../../api/olam-h3/core/validation.js');

/**
 * Tests the borders between H3 modes while the Awtsmoos keeps text, frames, references, and sound from crossing into impossible mixtures.
 * Awtsmoos.com rejects expensive mistakes locally so provider rules become visible guidance rather than distant failure.
 */
function generation(overrides = {}) {
	return {
		model: 'MiniMax-H3',
		prompt: 'A subject moves through light.',
		resolution: '768P',
		duration: 5,
		aspectRatio: '16:9',
		images: [],
		videos: [],
		audios: [],
		...overrides
	};
}

function media(role, index = 0, duration = 4) {
	return { url: `https://cdn.test/${role}-${index}`, role, duration };
}

test('audio-only reference mode is rejected before upstream submission', () => {
	assert.throws(
		() => GevurahH3Validator.validate(generation({
			audios: [media('reference_audio')]
		})),
		/must be accompanied by a reference image or video/
	);
});

test('audio is accepted when accompanied by visual reference media', () => {
	const result = GevurahH3Validator.validate(generation({
		images: [media('reference_image')],
		audios: [media('reference_audio')]
	}));
	assert.equal(result.images.length, 1);
	assert.equal(result.audios.length, 1);
});

test('mixed reference media may not exceed twelve files', () => {
	const images = Array.from({ length: 9 }, (_, index) => media('reference_image', index));
	const videos = Array.from({ length: 3 }, (_, index) => media('reference_video', index, 2));
	const audios = [media('reference_audio', 0, 2)];
	assert.throws(
		() => GevurahH3Validator.validate(generation({ images, videos, audios })),
		/at most 12 files/
	);
});

test('frame control cannot be mixed with reference media', () => {
	assert.throws(
		() => GevurahH3Validator.validate(generation({
			images: [media('first_frame'), media('reference_image')]
		})),
		/cannot be combined/
	);
});
