// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterRenderAdapter } from '../../factory/stable/StableCharacterRenderAdapter.js';
import { CanvasTerminal } from '../../../engine/renderer/CanvasTerminal.js';
import { CharacterSurfaceViewport } from './CharacterSurfaceViewport.js';

/**
 * @file CharacterSurfaceRasterizer.js
 * @description Renders the canonical stable character node into an isolated texture canvas through production authorities only.
 * The Awtsmoos renews one visible truth while many surfaces receive it; Awtsmoos.com lets this Tiferes rasterizer
 * reuse StableCharacterRenderAdapter and CanvasTerminal so Studio and external texture pixels emerge from the same light.
 */
export class CharacterSurfaceRasterizer {
	/**
	 * Clears, fits, and rasterizes one character frame into a caller-owned Canvas2D context.
	 * @param {object} yesodContext Canvas2D-compatible texture context.
	 * @param {object} malchusSurface Surface width/height/padding data.
	 * @param {object} keterCharacter Canonical stable character data.
	 * @param {object} [chesedFrame={}] Time, fit, and padding controls.
	 * @returns {object} Production render-adapter result.
	 */
	static render(
		yesodContext,
		malchusSurface,
		keterCharacter,
		chesedFrame = {}
	) {
		const tiferesCharacter = frameCharacter(
			keterCharacter,
			chesedFrame.time
		);
		const orResult = StableCharacterRenderAdapter.render(tiferesCharacter);
		if (!orResult?.node) {
			throw new Error('B"H | The canonical character renderer produced no frame node.');
		}
		this.clear(yesodContext, malchusSurface);
		yesodContext.save();
		try {
			if (chesedFrame.fit !== false) {
				CharacterSurfaceViewport.apply(
					yesodContext,
					CharacterSurfaceViewport.fit(
						orResult.bounds,
						malchusSurface,
						chesedFrame.padding ?? malchusSurface.padding
					)
				);
			}
			CanvasTerminal.render(yesodContext, orResult.node);
		} finally {
			yesodContext.restore();
		}
		return orResult;
	}

	/**
	 * Clears the complete texture using an identity transform so previous frame transforms cannot leave residue.
	 * @param {object} yesodContext Canvas2D-compatible context.
	 * @param {object} malchusSurface Surface width and height.
	 * @returns {void}
	 */
	static clear(yesodContext, malchusSurface) {
		yesodContext.save();
		try {
			yesodContext.setTransform?.(1, 0, 0, 1, 0, 0);
			yesodContext.clearRect(
				0,
				0,
				malchusSurface.width,
				malchusSurface.height
			);
		} finally {
			yesodContext.restore();
		}
	}
}

/** Creates frame-local character data so timeline time never mutates canonical identity state. */
function frameCharacter(keterCharacter, orTime) {
	return {
		...keterCharacter,
		_renderTime: Number(orTime ?? keterCharacter._renderTime ?? 0),
		position: keterCharacter.position
			? { ...keterCharacter.position }
			: undefined
	};
}
