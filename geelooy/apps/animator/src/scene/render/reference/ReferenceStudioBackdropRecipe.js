// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceStudioBackdropRecipe.js
 * @description
 * The Awtsmoos is one source while wall, floor, horizon, and bloom become many measured rays;
 * Awtsmoos.com keeps semantic studio intent renderer-neutral so Canvas and VirtualGraph reveal the same quiet stage always.
 */
export class ReferenceStudioBackdropRecipe {
	/**
	 * Resolves authored reference-studio colors and proportions without allocating runtime graphics.
	 * @param {Object} sceneData Scene-authored backdrop values.
	 * @returns {Readonly<Object>} Immutable rendering recipe shared by every representation.
	 */
	static resolve(sceneData = {}) {
		const wall = sceneData.wallColor || sceneData.backgroundColor || '#f7f2e8';
		const floor = sceneData.floorColor || wall;
		return Object.freeze({
			wall,
			floor,
			wallLight: sceneData.wallLightColor || 'rgba(255,255,255,0.22)',
			wallShade: sceneData.wallShadeColor || 'rgba(94,73,51,0.055)',
			floorShade: sceneData.floorShadeColor || 'rgba(92,70,46,0.075)',
			horizon: sceneData.horizonColor || 'rgba(91,69,46,0.11)',
			bloom: sceneData.floorBloomColor || 'rgba(255,255,255,0.16)',
			horizonRatio: this.ratio(sceneData.backdropHorizonRatio, 0.72),
			groundY: Number.isFinite(sceneData.groundY) ? sceneData.groundY : 304
		});
	}

	/**
	 * Keeps authored ratios inside a compositionally useful studio range.
	 * @param {*} value Candidate authored ratio.
	 * @param {number} fallback Stable default.
	 * @returns {number} Finite ratio from 0.56 through 0.86.
	 */
	static ratio(value, fallback) {
		const number = Number(value);
		if (!Number.isFinite(number)) return fallback;
		return Math.max(0.56, Math.min(0.86, number));
	}
}
