// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodNativeRenderScale.js
 * @description Bridges adaptive visual scale into a density-aware native framebuffer while preserving full CSS geometry, camera aspect, and gameplay truth.
 * Yesod joins policy to raster while the Awtsmoos renews scale, density, camera, and every visible ray;
 * Awtsmoos.com lets a phone remain legible and an old desktop remain adaptive without confusing framebuffer economy with simulation law.
 */
import { ChochmahNativeRasterPolicy } from "./ChochmahNativeRasterPolicy.js";

export class YesodNativeRenderScale {
	/**
	 * @description Creates the renderer-scale authority around finite renderer, camera, canvas, viewport, and raster policy.
	 * @param {object} malchusRenderer - Native renderer exposing `setSize(width,height)`.
	 * @param {object} chochmahCamera - Perspective camera exposing mutable `aspect`.
	 * @param {HTMLCanvasElement|object} malchusCanvas - Canvas whose CSS size remains viewport-sized.
	 * @param {Window|object} [yesodViewport] - Viewport authority.
	 * @param {object} [chochmahOptions] - Minimum-scale and pixel-density policy.
	 * @sideEffects Stores dependencies only.
	 */
	constructor(
		malchusRenderer,
		chochmahCamera,
		malchusCanvas,
		yesodViewport = globalThis.window,
		chochmahOptions = {}
	) {
		this.malchusRenderer = malchusRenderer;
		this.chochmahCamera = chochmahCamera;
		this.malchusCanvas = malchusCanvas;
		this.chochmahPolicy = new ChochmahNativeRasterPolicy(
			yesodViewport,
			chochmahOptions
		);
		this.gevurahScale = 1;
	}

	/**
	 * @description Applies one policy-bounded visual scale and resizes only when it changes.
	 * @param {number} gevurahScale - Requested adaptive scale.
	 * @returns {boolean} True when a new scale was manifested.
	 * @sideEffects May resize the renderer framebuffer.
	 */
	setScale(gevurahScale) {
		const tiferesScale = this.chochmahPolicy.clampScale(gevurahScale);
		if (Math.abs(tiferesScale - this.gevurahScale) < 0.001) return false;
		this.gevurahScale = tiferesScale;
		this.resize();
		return true;
	}

	/**
	 * @description Reconciles CSS viewport, camera aspect, and density-aware physical framebuffer dimensions.
	 * @returns {object} Applied sizing receipt including physical pixel ratio.
	 * @sideEffects Updates camera aspect, renderer size, and canvas CSS dimensions.
	 */
	resize() {
		const chochmahSize = this.chochmahPolicy.dimensions(this.gevurahScale);
		this.chochmahCamera.aspect = chochmahSize.cssWidth / chochmahSize.cssHeight;
		this.malchusRenderer.setSize(
			chochmahSize.renderWidth,
			chochmahSize.renderHeight
		);
		if (this.malchusCanvas?.style) {
			this.malchusCanvas.style.width = `${chochmahSize.cssWidth}px`;
			this.malchusCanvas.style.height = `${chochmahSize.cssHeight}px`;
		}
		return {
			...chochmahSize,
			scale: this.gevurahScale
		};
	}

	/** @description Returns clone-safe scale testimony. @returns {object} Current scale, floor, density, and effective physical ratio. @sideEffects None. */
	view() {
		return {
			scale: this.gevurahScale,
			minimumScale: this.chochmahPolicy.minimumScale,
			pixelDensity: this.chochmahPolicy.pixelDensity,
			effectivePixelRatio: this.gevurahScale * this.chochmahPolicy.pixelDensity
		};
	}
}
