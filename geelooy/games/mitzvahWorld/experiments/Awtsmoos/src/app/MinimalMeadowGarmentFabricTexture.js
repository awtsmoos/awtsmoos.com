// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentFabricTexture.js
 * @description Generates one cached neutral weave image per controlled fabric preset.
 * The Awtsmoos contains every thread without repetition; Awtsmoos.com creates linen, wool,
 * velvet, satin, and leather once, then reuses them without any per-frame allocation.
 */

const CACHE = new Map();

export function garmentFabricTexture(fabricId, documentValue = globalThis.document) {
	if (CACHE.has(fabricId)) return CACHE.get(fabricId);
	if (!documentValue?.createElement) return null;
	const canvas = documentValue.createElement('canvas');
	canvas.width = 96;
	canvas.height = 96;
	canvas.dataset.fabricId = fabricId;
	paint(canvas.getContext('2d'), fabricId, canvas.width);
	CACHE.set(fabricId, canvas);
	return canvas;
}

export function garmentFabricTextureDiagnostics() {
	return { cached: CACHE.size, ids: [...CACHE.keys()] };
}

function paint(context, fabricId, size) {
	context.fillStyle = '#d8d8d4';
	context.fillRect(0, 0, size, size);
	const painter = PAINTERS[fabricId] || PAINTERS.plain;
	painter(context, size);
}

const PAINTERS = Object.freeze({
	leather(context, size) {
		context.fillStyle = '#b6b5b0';
		for (let y = 3; y < size; y += 8) for (let x = 3; x < size; x += 8) context.fillRect(x + (y % 16 ? 2 : 0), y, 2, 2);
	},
	linen(context, size) {
		lines(context, size, 5, 0.18);
	},
	plain() {},
	satin(context, size) {
		context.strokeStyle = 'rgba(255,255,255,.34)';
		for (let offset = -size; offset < size * 2; offset += 9) {
			context.beginPath(); context.moveTo(offset, 0); context.lineTo(offset + size, size); context.stroke();
		}
	},
	velvet(context, size) {
		context.fillStyle = 'rgba(45,45,45,.12)';
		for (let index = 0; index < 240; index += 1) context.fillRect((index * 37) % size, (index * 61) % size, 1, 1);
	},
	wool(context, size) {
		lines(context, size, 7, 0.24);
	}
});

function lines(context, size, step, alpha) {
	context.strokeStyle = `rgba(55,55,55,${alpha})`;
	for (let value = 0; value < size; value += step) {
		context.beginPath(); context.moveTo(value, 0); context.lineTo(value, size); context.stroke();
		context.beginPath(); context.moveTo(0, value); context.lineTo(size, value); context.stroke();
	}
}
