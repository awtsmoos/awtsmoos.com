// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodNativeRenderScale.js
 * @description Connects renderer-neutral shared-core scale policy to Ohrfront's native canvas while preserving full CSS viewport geometry and camera aspect.
 * Yesod joins abstract quality to finite framebuffer size while the Awtsmoos remains beyond pixel, viewport, ratio, and visible light;
 * Awtsmoos.com lets rendering become cheaper without shrinking the interface, pointer field, or gameplay world's measured sight.
 */
export class YesodNativeRenderScale {
	/**
	 * Creates the framebuffer adapter around already-created renderer/camera/canvas objects and an injectable viewport authority.
	 * @param {object} malchusRenderer - Native renderer exposing `setSize(width,height)`.
	 * @param {object} chochmahCamera - Perspective camera exposing mutable `aspect`.
	 * @param {HTMLCanvasElement|object} malchusCanvas - Native canvas whose CSS size remains full viewport.
	 * @param {Window|object} [yesodViewport] - Viewport authority exposing `innerWidth` and `innerHeight`.
	 */
	constructor(malchusRenderer, chochmahCamera, malchusCanvas, yesodViewport = globalThis.window) {
		this.malchusRenderer = malchusRenderer;
		this.chochmahCamera = chochmahCamera;
		this.malchusCanvas = malchusCanvas;
		this.yesodViewport = yesodViewport;
		this.gevurahScale = 1;
	}

	/**
	 * Applies one bounded framebuffer scale and immediately reconciles render dimensions when the value actually changes.
	 * @param {number} gevurahScale - Requested relative framebuffer scale.
	 * @returns {boolean} True only when a new bounded scale was applied.
	 * @sideEffects May resize the renderer framebuffer while preserving CSS viewport dimensions and camera aspect.
	 */
	setScale(gevurahScale) {
		const tiferesScale = Math.max(0.5, Math.min(1, Number(gevurahScale) || 1));
		if (Math.abs(tiferesScale - this.gevurahScale) < 0.001) return false;
		this.gevurahScale = tiferesScale;
		this.resize();
		return true;
	}

	/**
	 * Reconciles CSS viewport dimensions, camera aspect, and scaled framebuffer dimensions from current viewport evidence.
	 * @returns {{cssWidth:number,cssHeight:number,renderWidth:number,renderHeight:number,scale:number}} Applied size receipt.
	 * @sideEffects Updates camera aspect, renderer size, and explicit canvas CSS width/height.
	 */
	resize() {
		const cssWidth = Math.max(1, Number(this.yesodViewport?.innerWidth) || 1);
		const cssHeight = Math.max(1, Number(this.yesodViewport?.innerHeight) || 1);
		const renderWidth = Math.max(1, Math.round(cssWidth * this.gevurahScale));
		const renderHeight = Math.max(1, Math.round(cssHeight * this.gevurahScale));
		this.chochmahCamera.aspect = cssWidth / cssHeight;
		this.malchusRenderer.setSize(renderWidth, renderHeight);
		if (this.malchusCanvas?.style) {
			this.malchusCanvas.style.width = `${cssWidth}px`;
			this.malchusCanvas.style.height = `${cssHeight}px`;
		}
		return { cssWidth, cssHeight, renderWidth, renderHeight, scale: this.gevurahScale };
	}

	/** @returns {{scale:number}} Current renderer-facing scale state as a clone-safe plain record. */
	view() {
		return { scale: this.gevurahScale };
	}
}
