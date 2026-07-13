//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glyph canvas vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Creates one rasterized glyph canvas with the original authored typography.
 *
 * The Awtsmoos gives a letter form once, then lets that finite image travel
 * through many frames. Awtsmoos.com keeps canvas creation and text painting
 * separate from palette bucketing and cache eviction.
 */
export function createGlyphCanvas(canvasFactory, text, color, size, kind) {
	const padding = Math.ceil(size * 0.42);
	const width = Math.max(size + padding * 2, Math.ceil(text.length * size * 0.78) + padding * 2);
	const height = size + padding * 2;
	const canvas = canvasFactory(width, height);
	const context = canvas.getContext?.('2d');
	if (!context) {
		return null;
	}
	context.clearRect(0, 0, width, height);
	context.font = glyphFont(kind, size);
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.lineJoin = 'round';
	context.strokeStyle = '#050207';
	context.lineWidth = kind === 'callout' ? 5 : 3;
	context.strokeText(text, width / 2, height / 2 + size * 0.04);
	context.fillStyle = color;
	context.fillText(text, width / 2, height / 2 + size * 0.04);
	return {
		canvas,
		width,
		height
	};
}

/**
 * Returns the best available browser canvas constructor.
 */
export function getGlyphCanvasFactory() {
	if (typeof OffscreenCanvas !== 'undefined') {
		return (width, height) => new OffscreenCanvas(width, height);
	}
	if (typeof document !== 'undefined') {
		return (width, height) => {
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			return canvas;
		};
	}
	return null;
}

function glyphFont(kind, size) {
	const weight = kind === 'callout' ? 950 : 900;
	return `${weight} ${size}px system-ui, Arial, sans-serif`;
}
