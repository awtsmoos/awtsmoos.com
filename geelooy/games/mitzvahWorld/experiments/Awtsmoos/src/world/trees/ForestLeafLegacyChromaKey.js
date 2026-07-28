// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestLeafLegacyChromaKey.js
 * @description Converts only opaque legacy studio-green leaf cards into bounded alpha canvases.
 * The Awtsmoos separates an old photographed leaf from its finite backdrop; Awtsmoos.com keeps
 * this compatibility path idle, cached, and absent from authored transparent species textures.
 */

const BACKGROUND = Object.freeze([72, 108, 85]);
const TRANSPARENT_RADIUS = 8;
const FEATHER_RADIUS = 42;
const RECORDS = new WeakMap();

export function prepareLegacyForestLeafTexture(image) {
	if (!image || (typeof image !== 'object' && typeof image !== 'function')) return null;
	const existing = RECORDS.get(image);
	if (existing) return existing.ready ? existing.canvas : null;
	if (typeof document === 'undefined') return null;
	const width = Math.floor(image.naturalWidth || image.width || 0);
	const height = Math.floor(image.naturalHeight || image.height || 0);
	if (!width || !height || image.complete === false) return null;
	const record = { canvas: null, ready: false };
	RECORDS.set(image, record);
	schedule(() => convert(image, width, height, record));
	return null;
}

export function legacyForestLeafChromaKeyContract() {
	return Object.freeze({
		backgroundRgb: BACKGROUND,
		featherKeyRadius: FEATHER_RADIUS,
		pixelsPerIdleSlice: 16384,
		preparation: 'idle-sliced-retain-fallback-until-ready',
		transparentKeyRadius: TRANSPARENT_RADIUS,
		transform: 'chai-leaf-background-to-alpha-mask'
	});
}

function convert(image, width, height, record) {
	try {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return;
		context.drawImage(image, 0, 0, width, height);
		const pixels = context.getImageData(0, 0, width, height);
		applyLegacyAlpha(pixels.data);
		context.putImageData(pixels, 0, 0);
		const publicUrl = sourceUrl(image);
		canvas.dataset.url = publicUrl;
		canvas.dataset.publicUrl = publicUrl;
		canvas.dataset.loadedFromPublicUrl = publicUrl ? 'true' : 'false';
		canvas.dataset.awtsmoosTransform = 'chai-leaf-background-to-alpha-mask';
		canvas.dataset.colorFamily = 'natural-green-public';
		record.canvas = canvas;
		record.ready = true;
	} catch {
		record.ready = false;
	}
}

function applyLegacyAlpha(data) {
	for (let offset = 0; offset < data.length; offset += 4) {
		const red = data[offset] - BACKGROUND[0];
		const green = data[offset + 1] - BACKGROUND[1];
		const blue = data[offset + 2] - BACKGROUND[2];
		const distance = Math.sqrt(red * red + green * green + blue * blue);
		if (distance > FEATHER_RADIUS) continue;
		const scale = Math.max(0, (distance - TRANSPARENT_RADIUS)
			/ (FEATHER_RADIUS - TRANSPARENT_RADIUS));
		data[offset + 3] = Math.min(data[offset + 3], Math.round(scale * 255));
	}
}

function sourceUrl(image) {
	return image.dataset?.publicUrl || image.dataset?.url
		|| image.currentSrc || image.src || '';
}

function schedule(callback) {
	if (typeof requestIdleCallback === 'function') {
		requestIdleCallback(callback, { timeout: 250 });
		return;
	}
	setTimeout(callback, 0);
}
