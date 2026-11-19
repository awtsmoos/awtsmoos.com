// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralSkyTexture.test.js
 * @description Proves the generated day-sky image is blue overhead, pale
 * at the horizon, and carries soft white clouds — pure pixels, no DOM.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createProceduralSkyImage } from './ProceduralSkyTexture.js';

function pixel(image, x, y) {
	const at = (y * image.width + x) * 4;
	return [image.data[at], image.data[at + 1], image.data[at + 2], image.data[at + 3]];
}

test('the sky image is a 512x256 opaque RGBA field', () => {
	const image = createProceduralSkyImage();
	assert.equal(image.width, 512);
	assert.equal(image.height, 256);
	assert.equal(image.data.length, 512 * 256 * 4);
	assert.ok(image.data.every((value, index) => (index + 1) % 4 === 0 ? value === 255 : value >= 0));
	assert.equal(createProceduralSkyImage(), image);
});

test('the zenith is blue and the horizon is pale', () => {
	const image = createProceduralSkyImage();
	const zenith = pixel(image, 256, 2);
	assert.ok(zenith[2] > 180 && zenith[2] > zenith[0] + 100, `zenith should be blue, got ${zenith}`);
	const horizon = pixel(image, 256, 254);
	assert.ok(horizon[0] > 170 && horizon[1] > 190, `horizon should be pale, got ${horizon}`);
	const mid = pixel(image, 256, 128);
	assert.ok(mid[2] > horizon[2] - 30 && mid[0] < horizon[0], `mid sky should sit between, got ${mid}`);
});

test('clouds whiten the sky without painting a solid sheet', () => {
	const image = createProceduralSkyImage();
	let whitest = 0;
	let whiteCount = 0;
	for (let y = 20; y < 200; y += 2) {
		for (let x = 0; x < 512; x += 2) {
			const [r, g, b] = pixel(image, x, y);
			const brightness = (r + g + b) / 3;
			if (brightness > whitest) whitest = brightness;
			if (r > 245 && g > 245 && b > 240) whiteCount += 1;
		}
	}
	assert.ok(whitest > 245, `some cloud pixel should be near-white, whitest was ${whitest}`);
	assert.ok(whiteCount > 100, `clouds should cover real sky, only ${whiteCount} near-white samples`);
	assert.ok(whiteCount < 20000, `clouds must not white out the sky, ${whiteCount} near-white samples`);
});
