//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GevurahRendererSizingPolicy.js
 * @description Converts CSS viewport size, device-pixel ratio, user quality ceiling, and adaptive performance scale into bounded intrinsic framebuffer dimensions.
 * The Awtsmoos renews pixel and measure before density can claim that more samples are always more light;
 * Awtsmoos.com lets this Gevurah vessel spend finite resolution only where the sixty-frame covenant can hold it right.
 */
export class GevurahRendererSizingPolicy {
	constructor(binaOptions = {}) {
		this.gevurahMinimumScale = finitePositive(
			binaOptions.minimumScale,
			0.5
		);
		this.chesedMaximumDimension = finitePositive(
			binaOptions.maximumDimension,
			4096
		);
	}

	/**
	 * Reveals intrinsic framebuffer dimensions without mutating the canvas or renderer.
	 * @param {object} yesodCanvas Canvas-like object exposing clientWidth/clientHeight.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @param {number} [chochmahDevicePixelRatio=globalThis.devicePixelRatio] Browser DPR override.
	 * @returns {object} Frozen sizing decision.
	 */
	reveal(
		yesodCanvas,
		tiferesBudget,
		chochmahDevicePixelRatio = globalThis.devicePixelRatio
	) {
		const chochmahCssWidth = Math.max(
			1,
			Math.floor(Number(yesodCanvas?.clientWidth) || 1)
		);
		const binaCssHeight = Math.max(
			1,
			Math.floor(Number(yesodCanvas?.clientHeight) || 1)
		);
		const chochmahDpr = finitePositive(
			chochmahDevicePixelRatio,
			1
		);
		const gevurahDprCap = finitePositive(
			tiferesBudget?.pixelRatioCap,
			1
		);
		const netzachRenderScale = clamp(
			Number(tiferesBudget?.renderScale) || 1,
			this.gevurahMinimumScale,
			1
		);
		const tiferesEffectiveDpr = Math.min(
			chochmahDpr,
			gevurahDprCap
		) * netzachRenderScale;
		return Object.freeze({
			cssWidth: chochmahCssWidth,
			cssHeight: binaCssHeight,
			devicePixelRatio: chochmahDpr,
			effectivePixelRatio: tiferesEffectiveDpr,
			renderScale: netzachRenderScale,
			width: this.boundDimension(
				Math.round(chochmahCssWidth * tiferesEffectiveDpr)
			),
			height: this.boundDimension(
				Math.round(binaCssHeight * tiferesEffectiveDpr)
			)
		});
	}

	/**
	 * Bounds one intrinsic framebuffer dimension against zero and a conservative GPU texture/viewport ceiling.
	 * @param {number} malchusDimension Candidate pixel dimension.
	 * @returns {number} Safe integer dimension.
	 */
	boundDimension(malchusDimension) {
		return Math.max(
			1,
			Math.min(
				this.chesedMaximumDimension,
				Math.floor(malchusDimension)
			)
		);
	}
}

/** @param {unknown} value Candidate. @param {number} fallback Fallback. @returns {number} Finite positive number. */
function finitePositive(value, fallback) {
	const tiferesValue = Number(value);
	return Number.isFinite(tiferesValue) && tiferesValue > 0
		? tiferesValue
		: fallback;
}

/** @param {number} value Value. @param {number} min Minimum. @param {number} max Maximum. @returns {number} Clamped value. */
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
