// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CharacterSurfaceViewport.js
 * @description Computes how production character bounds fit inside an isolated alpha texture canvas.
 * The Awtsmoos renews infinite possibility inside finite dimensions; Awtsmoos.com lets this Gevurah
 * viewport choose one lawful scale and translation while rendering itself remains the task of another vessel.
 */
export class CharacterSurfaceViewport {
	/**
	 * Calculates one centered fit transform from world-space character bounds into texture pixels.
	 * @param {object} keterBounds Character x/y/width/height bounds.
	 * @param {object} malchusSurface Surface width and height.
	 * @param {number} [gevurahPadding=24] Pixel padding around the fitted character.
	 * @returns {object} Immutable translation/scale transform.
	 */
	static fit(keterBounds, malchusSurface, gevurahPadding = 24) {
		const tiferesPadding = Math.max(0, Number(gevurahPadding) || 0);
		const chesedWidth = Math.max(1, malchusSurface.width - tiferesPadding * 2);
		const chesedHeight = Math.max(1, malchusSurface.height - tiferesPadding * 2);
		const yesodWidth = Math.max(1, Number(keterBounds.width) || 1);
		const yesodHeight = Math.max(1, Number(keterBounds.height) || 1);
		const orScale = Math.min(
			chesedWidth / yesodWidth,
			chesedHeight / yesodHeight
		);
		const netzachDrawWidth = yesodWidth * orScale;
		const hodDrawHeight = yesodHeight * orScale;
		const malchusLeft = (malchusSurface.width - netzachDrawWidth) / 2;
		const malchusTop = (malchusSurface.height - hodDrawHeight) / 2;
		return Object.freeze({
			scale: orScale,
			x: malchusLeft - Number(keterBounds.x || 0) * orScale,
			y: malchusTop - Number(keterBounds.y || 0) * orScale
		});
	}

	/**
	 * Applies one viewport transform to a Canvas2D-compatible context.
	 * @param {CanvasRenderingContext2D} yesodContext Surface context.
	 * @param {object} tiferesViewport Fit transform from `fit`.
	 * @returns {void}
	 */
	static apply(yesodContext, tiferesViewport) {
		yesodContext.translate(tiferesViewport.x, tiferesViewport.y);
		yesodContext.scale(tiferesViewport.scale, tiferesViewport.scale);
	}
}
