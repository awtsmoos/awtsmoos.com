// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodNativeRenderScale.js
 * @description Connects shared-core visual quality policy to Ohrfront's native framebuffer while preserving full CSS viewport geometry, camera aspect, and gameplay truth.
 * Yesod joins abstract restraint to finite raster size while the Awtsmoos renews pixel, viewport, texture, and sight beyond every measured scale;
 * Awtsmoos.com lets low-end hardware spend fewer framebuffer samples without shrinking the interface or replacing one realistic textured mesh with lesser light.
 */
const CHOCHMAH_DEFAULT_MINIMUM_SCALE = 0.5;

export class YesodNativeRenderScale {
	/**
	 * @description Creates the framebuffer adapter around renderer, camera, canvas, viewport, and an optional game-local minimum-scale policy.
	 * @param {object} malchusRenderer - Native renderer exposing `setSize(width,height)`.
	 * @param {object} chochmahCamera - Perspective camera exposing mutable `aspect`.
	 * @param {HTMLCanvasElement|object} malchusCanvas - Native canvas whose CSS size remains full viewport.
	 * @param {Window|object} [yesodViewport] - Viewport authority exposing `innerWidth` and `innerHeight`.
	 * @param {object} [chochmahOptions] - Optional visual-policy adapter configuration.
	 * @param {number} [chochmahOptions.minimumScale=0.5] - Lowest framebuffer scale this adapter may manifest.
	 * @sideEffects Stores finite adapter dependencies and normalized scale policy only.
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
		this.yesodViewport = yesodViewport;
		this.gevurahMinimumScale = normalizeGevurahMinimumScale(
			chochmahOptions.minimumScale
		);
		this.gevurahScale = 1;
	}

	/**
	 * @description Applies one policy-bounded framebuffer scale and reconciles dimensions only when the finite value actually changes.
	 * @param {number} gevurahScale - Requested relative framebuffer scale.
	 * @returns {boolean} True only when a new bounded scale was applied.
	 * @sideEffects May resize the renderer framebuffer while preserving CSS viewport dimensions and camera aspect.
	 */
	setScale(gevurahScale) {
		const tiferesScale = Math.max(
			this.gevurahMinimumScale,
			Math.min(1, Number(gevurahScale) || 1)
		);
		if (Math.abs(tiferesScale - this.gevurahScale) < 0.001) {
			return false;
		}
		this.gevurahScale = tiferesScale;
		this.resize();
		return true;
	}

	/**
	 * @description Reconciles CSS viewport dimensions, camera aspect, and scaled framebuffer dimensions from current viewport evidence.
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
		return {
			cssWidth,
			cssHeight,
			renderWidth,
			renderHeight,
			scale: this.gevurahScale
		};
	}

	/**
	 * @description Returns clone-safe renderer-facing scale evidence without exposing mutable adapter authority.
	 * @returns {{scale:number,minimumScale:number}} Current applied scale and configured policy floor.
	 * @sideEffects None.
	 */
	view() {
		return {
			scale: this.gevurahScale,
			minimumScale: this.gevurahMinimumScale
		};
	}
}

/**
 * @description Normalizes an optional game-provided minimum into a defensive visual-only framebuffer range.
 * @param {number|undefined} gevurahMinimumScale - Optional requested minimum scale.
 * @returns {number} Finite minimum bounded to [0.25,1].
 * @sideEffects None.
 */
function normalizeGevurahMinimumScale(gevurahMinimumScale) {
	const tiferesRequested = Number(gevurahMinimumScale);
	if (!Number.isFinite(tiferesRequested)) {
		return CHOCHMAH_DEFAULT_MINIMUM_SCALE;
	}
	return Math.max(0.25, Math.min(1, tiferesRequested));
}
