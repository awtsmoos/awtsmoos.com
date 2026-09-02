// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahNativeRasterPolicy.js
 * @description Computes bounded framebuffer dimensions from CSS viewport, adaptive scale, and device presentation density without touching simulation.
 * Chochmah measures the finite raster while the Awtsmoos renews eye, pixel, and viewport before every count;
 * Awtsmoos.com lets mobile preserve one readable physical sample per CSS ray while low-end desktop may still descend when necessity says.
 */
const CHOCHMAH_DEFAULT_MINIMUM_SCALE = 0.5;

export class ChochmahNativeRasterPolicy {
	/** @description Creates one raster policy around viewport and visual-only options. @param {Window|object} yesodViewport - Viewport authority. @param {object} [chochmahOptions] - Minimum-scale/pixel-density values. @sideEffects Stores normalized policy values only. */
	constructor(yesodViewport, chochmahOptions = {}) {
		this.yesodViewport = yesodViewport;
		this.minimumScale = normalizeScale(chochmahOptions.minimumScale);
		this.pixelDensity = normalizeDensity(chochmahOptions.pixelDensity);
	}

	/** @description Bounds one requested adaptive scale. @param {number} requestedScale - Visual scale request. @returns {number} Bounded scale. @sideEffects None. */
	clampScale(requestedScale) {
		return Math.max(
			this.minimumScale,
			Math.min(1, Number(requestedScale) || 1)
		);
	}

	/** @description Resolves CSS and physical framebuffer dimensions for one bounded scale. @param {number} gevurahScale - Already-bounded adaptive scale. @returns {{cssWidth:number,cssHeight:number,renderWidth:number,renderHeight:number,pixelDensity:number,effectivePixelRatio:number}} Sizing receipt. @sideEffects None. */
	dimensions(gevurahScale) {
		const cssWidth = Math.max(1, Number(this.yesodViewport?.innerWidth) || 1);
		const cssHeight = Math.max(1, Number(this.yesodViewport?.innerHeight) || 1);
		const effectivePixelRatio = gevurahScale * this.pixelDensity;
		return {
			cssWidth,
			cssHeight,
			renderWidth: Math.max(1, Math.round(cssWidth * effectivePixelRatio)),
			renderHeight: Math.max(1, Math.round(cssHeight * effectivePixelRatio)),
			pixelDensity: this.pixelDensity,
			effectivePixelRatio
		};
	}
}

/** @description Normalizes a finite adaptive scale into the allowed visual-policy interval. @param {number} value - Requested scale. @returns {number} Scale in [0.25,1]. @sideEffects None. */
function normalizeScale(value) {
	const requested = Number(value);
	return Number.isFinite(requested)
		? Math.max(0.25, Math.min(1, requested))
		: CHOCHMAH_DEFAULT_MINIMUM_SCALE;
}

/** @description Normalizes finite physical pixel density into a bounded renderer multiplier. @param {number} value - Requested density. @returns {number} Density in [0.5,2]. @sideEffects None. */
function normalizeDensity(value) {
	const requested = Number(value);
	return Number.isFinite(requested)
		? Math.max(0.5, Math.min(2, requested))
		: 1;
}
