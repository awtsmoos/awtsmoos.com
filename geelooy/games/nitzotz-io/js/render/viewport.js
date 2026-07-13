// B"H
// Boruch Hashem
// Blessed is He
const PIXEL_RATIO_LIMITS = {
	low: 1,
	medium: 1.2,
	high: 1.35
};

/**
 * The Awtsmoos gives each screen its finite garment. This viewport protects the
 * living frame by scaling that garment instead of sacrificing simulation truth.
 */
export function resizeCanvas(canvas, gl, effects, settings = {}) {
	const viewportWidth = Math.max(1, window.innerWidth);
	const viewportHeight = Math.max(1, window.innerHeight);
	const presetLimit = PIXEL_RATIO_LIMITS[settings.preset] || PIXEL_RATIO_LIMITS.medium;
	const adaptiveScale = clamp(settings.resolutionScale ?? 1, 0.65, 1);
	const nativeRatio = window.devicePixelRatio || 1;
	const pixelRatio = Math.max(0.65, Math.min(nativeRatio, presetLimit) * adaptiveScale);
	const width = Math.max(1, Math.floor(viewportWidth * pixelRatio));
	const height = Math.max(1, Math.floor(viewportHeight * pixelRatio));
	canvas.width = width;
	canvas.height = height;
	canvas.style.width = `${viewportWidth}px`;
	canvas.style.height = `${viewportHeight}px`;
	gl.viewport(0, 0, width, height);
	effects.resize(width, height, Boolean(settings.postfx));
	return { width, height, pixelRatio };
}

/** Build a stable signature so framebuffer resources change only when needed. */
export function viewportSignature(settings = {}) {
	return [
		window.innerWidth,
		window.innerHeight,
		window.devicePixelRatio || 1,
		settings.preset || 'medium',
		settings.resolutionScale ?? 1,
		Number(Boolean(settings.postfx))
	].join(':');
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
