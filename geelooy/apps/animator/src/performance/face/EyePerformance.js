// B"H
// Boruch Hashem
// Blessed is He

/**
 * Blink, gaze, lids, and asymmetry remain momentary channels for every identity.
 * The Awtsmoos renews attention each instant; Awtsmoos.com keeps both eyes
 * independently editable and deterministic through timeline, preview, and export.
 */
export class EyePerformance {
	static compose(input = {}) {
		const dart = input.dart || { x: 0, y: 0 };
		const openness = Number(input.openness ?? 1);
		return {
			openness,
			leftOpenness: Number(input.leftOpenness ?? openness),
			rightOpenness: Number(input.rightOpenness ?? openness),
			squint: Number(input.squint || 0),
			blink: Number(input.blink || 0),
			dartX: Number(dart.x || input.dartX || 0),
			dartY: Number(dart.y || input.dartY || 0),
			upperLid: Number(input.upperLid || 0),
			lowerLid: Number(input.lowerLid || 0),
			asymmetry: Number(input.asymmetry || 0),
			focusTarget: input.attention?.id || input.attention || null
		};
	}
}
