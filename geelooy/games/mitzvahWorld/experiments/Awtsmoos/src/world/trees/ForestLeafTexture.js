// B"H
/**
 * @file ForestLeafTexture.js
 * @description Builds the green fallback and prepares opaque-source Chai leaves for MASK rendering.
 * The licensed Chai PNGs are RGB images on a witnessed #486c55 studio-green field. A one-time,
 * idle-sliced connected chroma key converts only edge-reachable background to alpha, avoiding
 * square foliage cards, protecting similar interior leaf greens, and preventing frame-time spikes.
 */

const CHAI_LEAF_BACKGROUND = Object.freeze([72, 108, 85]);
const TRANSPARENT_KEY_RADIUS = 8;
const FEATHER_KEY_RADIUS = 42;
const KEY_PIXELS_PER_IDLE_SLICE = 16384;

let cachedTexture = null;
const preparedPublicTextures = new WeakMap();

export function createForestLeafTexture() {
	if (cachedTexture || typeof document === 'undefined') return cachedTexture;
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	canvas.dataset.url = 'procedural://awtsmoos-forest-leaf-natural-green';
	canvas.dataset.awtsmoosFallback = 'forest-leaf-natural-green';
	canvas.dataset.colorFamily = 'natural-green';
	canvas.dataset.replaceableByPublicTexture = 'true';
	const context = canvas.getContext('2d');
	if (!context) return null;
	context.clearRect(0, 0, 64, 64);
	const gradient = context.createRadialGradient(24, 19, 3, 32, 34, 31);
	gradient.addColorStop(0, 'rgba(151,190,91,1)');
	gradient.addColorStop(0.68, 'rgba(62,122,54,0.98)');
	gradient.addColorStop(1, 'rgba(24,67,33,0)');
	context.fillStyle = gradient;
	context.beginPath();
	context.moveTo(32, 59);
	context.bezierCurveTo(7, 47, 4, 18, 30, 5);
	context.bezierCurveTo(55, 17, 59, 44, 32, 59);
	context.fill();
	context.strokeStyle = 'rgba(202,222,137,0.58)';
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(32, 58);
	context.quadraticCurveTo(29, 31, 31, 8);
	context.stroke();
	cachedTexture = canvas;
	return cachedTexture;
}

/**
 * Starts or observes one idle-sliced conversion of a CORS-enabled public Chai leaf image.
 * Null means preparation is pending or unavailable, so callers retain the natural-green
 * fallback and never expose the original opaque square. A later hydration cadence receives
 * the completed canvas from this WeakMap without repeating any pixel work.
 */
export function createForestLeafPublicTexture(image) {
	if (!image || (typeof image !== 'object' && typeof image !== 'function')) return null;
	const existing = preparedPublicTextures.get(image);
	if (existing) return existing.ready ? existing.canvas : null;
	if (typeof document === 'undefined') return null;
	const width = Math.floor(image.naturalWidth || image.width || 0);
	const height = Math.floor(image.naturalHeight || image.height || 0);
	if (!width || !height || image.complete === false) return null;
	const record = {
		canvas: null,
		context: null,
		failed: false,
		floodHead: 0,
		floodQueue: null,
		floodTail: 0,
		height,
		image,
		keyState: null,
		offset: 0,
		pixels: null,
		ready: false,
		width
	};
	preparedPublicTextures.set(image, record);
	scheduleLeafWork(() => initializePublicLeafTexture(record));
	return null;
}

export function forestLeafPublicTextureContract() {
	return Object.freeze({
		backgroundRgb: CHAI_LEAF_BACKGROUND,
		connectedBackgroundOnly: true,
		featherKeyRadius: FEATHER_KEY_RADIUS,
		pixelsPerIdleSlice: KEY_PIXELS_PER_IDLE_SLICE,
		preparation: 'idle-sliced-retain-fallback-until-ready',
		transparentKeyRadius: TRANSPARENT_KEY_RADIUS,
		transform: 'chai-leaf-background-to-alpha-mask'
	});
}

function initializePublicLeafTexture(record) {
	if (record.failed || record.ready) return;
	try {
		const canvas = document.createElement('canvas');
		canvas.width = record.width;
		canvas.height = record.height;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) {
			record.failed = true;
			return;
		}
		context.drawImage(record.image, 0, 0, record.width, record.height);
		record.canvas = canvas;
		record.context = context;
		record.pixels = context.getImageData(0, 0, record.width, record.height);
		record.keyState = new Uint8Array(record.width * record.height);
		classifyLeafPixelsSlice(record);
	} catch {
		record.failed = true;
	}
}

function classifyLeafPixelsSlice(record) {
	if (record.failed || record.ready || !record.pixels) return;
	const data = record.pixels.data;
	const pixelCount = record.width * record.height;
	const end = Math.min(pixelCount, record.offset + KEY_PIXELS_PER_IDLE_SLICE);
	const featherDistanceSquared = FEATHER_KEY_RADIUS * FEATHER_KEY_RADIUS;
	for (let index = record.offset; index < end; index += 1) {
		const offset = index * 4;
		const red = data[offset] - CHAI_LEAF_BACKGROUND[0];
		const green = data[offset + 1] - CHAI_LEAF_BACKGROUND[1];
		const blue = data[offset + 2] - CHAI_LEAF_BACKGROUND[2];
		if (red * red + green * green + blue * blue <= featherDistanceSquared) {
			record.keyState[index] = 1;
		}
	}
	record.offset = end;
	if (end < pixelCount) {
		scheduleLeafWork(() => classifyLeafPixelsSlice(record));
		return;
	}
	seedConnectedBackground(record);
	scheduleLeafWork(() => floodConnectedBackgroundSlice(record));
}

function seedConnectedBackground(record) {
	const pixelCount = record.width * record.height;
	record.floodQueue = new Int32Array(pixelCount);
	for (let x = 0; x < record.width; x += 1) {
		enqueueBackgroundPixel(record, x);
		enqueueBackgroundPixel(record, (record.height - 1) * record.width + x);
	}
	for (let y = 1; y < record.height - 1; y += 1) {
		enqueueBackgroundPixel(record, y * record.width);
		enqueueBackgroundPixel(record, y * record.width + record.width - 1);
	}
}

function floodConnectedBackgroundSlice(record) {
	if (record.failed || record.ready || !record.floodQueue) return;
	const pixelCount = record.width * record.height;
	const end = Math.min(
		record.floodTail,
		record.floodHead + KEY_PIXELS_PER_IDLE_SLICE
	);
	while (record.floodHead < end) {
		const index = record.floodQueue[record.floodHead++];
		const x = index % record.width;
		if (x > 0) enqueueBackgroundPixel(record, index - 1);
		if (x + 1 < record.width) enqueueBackgroundPixel(record, index + 1);
		if (index >= record.width) enqueueBackgroundPixel(record, index - record.width);
		if (index < pixelCount - record.width) enqueueBackgroundPixel(record, index + record.width);
	}
	if (record.floodHead < record.floodTail) {
		scheduleLeafWork(() => floodConnectedBackgroundSlice(record));
		return;
	}
	record.offset = 0;
	scheduleLeafWork(() => applyLeafAlphaSlice(record));
}

function enqueueBackgroundPixel(record, index) {
	if (record.keyState[index] !== 1) return;
	record.keyState[index] = 2;
	record.floodQueue[record.floodTail++] = index;
}

function applyLeafAlphaSlice(record) {
	if (record.failed || record.ready || !record.pixels) return;
	const data = record.pixels.data;
	const pixelCount = record.width * record.height;
	const end = Math.min(pixelCount, record.offset + KEY_PIXELS_PER_IDLE_SLICE);
	const transparentDistanceSquared = TRANSPARENT_KEY_RADIUS * TRANSPARENT_KEY_RADIUS;
	for (let index = record.offset; index < end; index += 1) {
		if (record.keyState[index] !== 2) continue;
		const offset = index * 4;
		const red = data[offset] - CHAI_LEAF_BACKGROUND[0];
		const green = data[offset + 1] - CHAI_LEAF_BACKGROUND[1];
		const blue = data[offset + 2] - CHAI_LEAF_BACKGROUND[2];
		const distanceSquared = red * red + green * green + blue * blue;
		if (distanceSquared <= transparentDistanceSquared) {
			data[offset + 3] = 0;
			continue;
		}
		const distance = Math.sqrt(distanceSquared);
		const alphaScale = (distance - TRANSPARENT_KEY_RADIUS)
			/ (FEATHER_KEY_RADIUS - TRANSPARENT_KEY_RADIUS);
		data[offset + 3] = Math.min(data[offset + 3], Math.round(alphaScale * 255));
	}
	record.offset = end;
	if (end < pixelCount) {
		scheduleLeafWork(() => applyLeafAlphaSlice(record));
		return;
	}
	finishPublicLeafTexture(record);
}

function finishPublicLeafTexture(record) {
	try {
		record.context.putImageData(record.pixels, 0, 0);
		const publicUrl = record.image.dataset?.publicUrl
			|| record.image.dataset?.url
			|| record.image.currentSrc
			|| record.image.src
			|| '';
		record.canvas.dataset.url = publicUrl;
		record.canvas.dataset.publicUrl = publicUrl;
		record.canvas.dataset.loadedFromPublicUrl = publicUrl ? 'true' : 'false';
		record.canvas.dataset.awtsmoosTransform = 'chai-leaf-background-to-alpha-mask';
		record.canvas.dataset.colorFamily = 'natural-green-public';
		record.canvas.dataset.sourceBackground = 'rgb(72,108,85)';
		record.context = null;
		record.floodQueue = null;
		record.image = null;
		record.keyState = null;
		record.pixels = null;
		record.ready = true;
	} catch {
		record.failed = true;
	}
}

function scheduleLeafWork(callback) {
	if (typeof requestIdleCallback === 'function') {
		requestIdleCallback(callback, { timeout: 250 });
		return;
	}
	setTimeout(callback, 0);
}

export default createForestLeafTexture;
