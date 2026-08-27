// B"H
// Boruch Hashem
// Blessed is He

/**
 * One complete neutral vessel receives each named emotional deformation. The
 * Awtsmoos renews every region from no fixed mask; Awtsmoos.com keeps pose data
 * readable, reusable, blendable, serializable, and deterministic in export.
 */
export class EmotionPoseFactory {
	static make(overrides = {}) {
		return {
			brows: {
				innerRaise: 0,
				outerRaise: 0,
				squeeze: 0,
				tilt: 0,
				asymmetry: 0,
				...(overrides.brows || {})
			},
			eyes: {
				openness: 1,
				leftOpenness: 1,
				rightOpenness: 1,
				squint: 0,
				blink: 0,
				dartX: 0,
				dartY: 0,
				upperLid: 0,
				lowerLid: 0,
				asymmetry: 0,
				...(overrides.eyes || {})
			},
			mouth: {
				open: 0,
				smile: 0,
				frown: 0,
				jaw: 0,
				width: 0.5,
				round: 0,
				press: 0,
				asymmetry: 0,
				teeth: 0,
				tongue: 0,
				...(overrides.mouth || {})
			},
			cheeks: {
				raise: 0,
				tension: 0,
				blush: 0,
				...(overrides.cheeks || {})
			},
			nose: {
				wrinkle: 0,
				...(overrides.nose || {})
			}
		};
	}
}
