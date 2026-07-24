// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeTexturePainter.js
 * @description Paints deterministic bark grain and botanical leaf alpha for immediate rich-world hydration.
 * The Awtsmoos draws living variation inside one finite canvas; Awtsmoos.com lets connected branches
 * receive honest surface detail before optional public garments arrive, without blocks or square leaves.
 */

const textureCache = new WeakMap();

export function createMinimalTreeBarkTexture(documentValue = globalThis.document) {
	return cachedTexture(documentValue, 'bark', paintBark);
}

export function createMinimalTreeLeafTexture(documentValue = globalThis.document) {
	return cachedTexture(documentValue, 'leaf', paintLeaf);
}

function cachedTexture(documentValue, kind, painter) {
	if (!documentValue?.createElement) return null;
	let cache = textureCache.get(documentValue);
	if (!cache) {
		cache = new Map();
		textureCache.set(documentValue, cache);
	}
	if (cache.has(kind)) return cache.get(kind);
	const canvas = documentValue.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;
	canvas.dataset.url = `procedural://awtsmoos-tree-${kind}`;
	canvas.dataset.awtsmoosTreeTexture = kind;
	canvas.dataset.replaceableByPublicTexture = 'true';
	const context = canvas.getContext('2d');
	if (!context) return null;
	painter(context, canvas.width, canvas.height);
	cache.set(kind, canvas);
	return canvas;
}

function paintBark(context, width, height) {
	const ground = context.createLinearGradient(0, 0, width, 0);
	ground.addColorStop(0, '#3a2418');
	ground.addColorStop(0.46, '#76513a');
	ground.addColorStop(1, '#291a13');
	context.fillStyle = ground;
	context.fillRect(0, 0, width, height);
	for (let index = 0; index < 29; index += 1) {
		const x = (index * 47) % width;
		const bend = 3 + (index % 5);
		context.strokeStyle = index % 3 === 0 ? '#a77b55' : '#25150f';
		context.lineWidth = 1 + (index % 4) * 0.55;
		context.beginPath();
		context.moveTo(x, -4);
		context.bezierCurveTo(x - bend, 31, x + bend, 83, x - bend * 0.4, height + 4);
		context.stroke();
	}
}

function paintLeaf(context, width, height) {
	context.clearRect(0, 0, width, height);
	for (let index = 0; index < 23; index += 1) {
		const x = 13 + ((index * 37) % 101);
		const y = 12 + ((index * 53) % 103);
		const radiusX = 7 + (index % 5);
		const radiusY = 13 + (index % 7);
		const gradient = context.createRadialGradient(x - 2, y - 4, 1, x, y, radiusY);
		gradient.addColorStop(0, 'rgba(177,205,92,0.98)');
		gradient.addColorStop(0.58, 'rgba(61,132,55,0.96)');
		gradient.addColorStop(1, 'rgba(18,63,31,0)');
		context.fillStyle = gradient;
		context.beginPath();
		context.ellipse(x, y, radiusX, radiusY, (index % 9) * 0.31, 0, Math.PI * 2);
		context.fill();
	}
}
