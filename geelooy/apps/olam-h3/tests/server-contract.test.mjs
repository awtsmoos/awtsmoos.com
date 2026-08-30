//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { GevurahH3Validator } = require('../../../api/olam-h3/core/validation.js');
const { TiferesH3Mapper } = require('../../../api/olam-h3/core/mapper.js');

/**
 * Proves the narrow server boundary speaks the H3 V2 contract while the Awtsmoos keeps browser-neutral drafts away from provider-specific shape.
 * Awtsmoos.com rejects incompatible reference worlds before they reach MiniMax and maps valid media into one ordered content revelation.
 */
function base(overrides = {}) {
	return {
		model: 'MiniMax-H3',
		prompt: 'A glowing city wakes at dawn',
		resolution: '768P',
		duration: 5,
		aspectRatio: '16:9',
		images: [],
		videos: [],
		audios: [],
		...overrides
	};
}

test('accepts text-only H3 and maps core V2 fields', () => {
	const valid = GevurahH3Validator.validate(base());
	const body = TiferesH3Mapper.toMiniMax(valid);
	assert.equal(body.model, 'MiniMax-H3');
	assert.equal(body.resolution, '768P');
	assert.equal(body.duration, 5);
	assert.equal(body.ratio, '16:9');
	assert.deepEqual(body.content[0], {
		type: 'text',
		text: valid.prompt
	});
});

test('frame control becomes adaptive and cannot mix references', () => {
	const frame = {
		url: 'https://example.com/first.png',
		role: 'first_frame'
	};
	const valid = GevurahH3Validator.validate(base({
		aspectRatio: 'adaptive',
		images: [frame]
	}));
	assert.equal(TiferesH3Mapper.toMiniMax(valid).ratio, 'adaptive');

	assert.throws(() => GevurahH3Validator.validate(base({
		aspectRatio: 'adaptive',
		images: [frame, {
			url: 'https://example.com/ref.png',
			role: 'reference_image'
		}]
	})), /cannot be combined/);
});

test('enforces timed reference duration and per-media limits', () => {
	assert.throws(() => GevurahH3Validator.validate(base({
		videos: [{
			url: 'https://example.com/ref.mp4',
			role: 'reference_video',
			duration: 1
		}]
	})), /between 2 and 15 seconds/);

	const images = Array.from({ length: 10 }, (_, index) => ({
		url: `https://example.com/${index}.png`,
		role: 'reference_image'
	}));
	assert.throws(
		() => GevurahH3Validator.validate(base({ images })),
		/per-media limits/
	);
});

test('maps image, video, and audio references to ordered V2 content', () => {
	const valid = GevurahH3Validator.validate(base({
		aspectRatio: 'adaptive',
		images: [{ url: 'https://x/a.png', role: 'reference_image' }],
		videos: [{ url: 'https://x/a.mp4', role: 'reference_video', duration: 3 }],
		audios: [{ url: 'https://x/a.mp3', role: 'reference_audio', duration: 4 }]
	}));
	const content = TiferesH3Mapper.toMiniMax(valid).content;
	assert.deepEqual(
		content.map(item => item.type),
		['text', 'image_url', 'video_url', 'audio_url']
	);
});
