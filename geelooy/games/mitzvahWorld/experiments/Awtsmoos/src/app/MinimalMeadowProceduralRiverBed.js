// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProceduralRiverBed.js
 * @description Provides one cached stone-silt fallback while uploaded river materials hydrate.
 * The Awtsmoos reveals a bed before distant water arrives; Awtsmoos.com keeps the fallback bounded,
 * deterministic, and replaceable so no network delay leaves a blank river or allocates every frame.
 */

const BED_CACHE = new WeakMap();

export function createMinimalMeadowProceduralRiverBed(documentValue) {
	if (BED_CACHE.has(documentValue)) return BED_CACHE.get(documentValue);
	const canvas = documentValue.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;
	const context = canvas.getContext('2d', { alpha: false });
	const image = context.createImageData(canvas.width, canvas.height);
	for (let y = 0; y < canvas.height; y += 1) {
		for (let x = 0; x < canvas.width; x += 1) {
			writeStone(image.data, (y * canvas.width + x) * 4, x, y);
		}
	}
	context.putImageData(image, 0, 0);
	canvas.dataset.awtsmoosRiverBed = 'procedural-stone-silt';
	BED_CACHE.set(documentValue, canvas);
	return canvas;
}

function writeStone(data, offset, x, y) {
	const stone = Math.max(0, Math.min(1, 0.5
		+ Math.sin(x * 0.074) * Math.cos(y * 0.061) * 0.28
		+ Math.sin((x + y) * 0.19) * Math.sin((x - y) * 0.13) * 0.22));
	data[offset] = 52 + Math.round(stone * 42);
	data[offset + 1] = 61 + Math.round(stone * 37);
	data[offset + 2] = 55 + Math.round(stone * 31);
	data[offset + 3] = 255;
}
