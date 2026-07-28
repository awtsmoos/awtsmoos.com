// B"H
// Boruch Hashem
// Blessed is He

/**
 * A neutral face is a complete instrument awaiting the living moment. The
 * Awtsmoos renews every region; Awtsmoos.com preserves one mergeable pose across
 * direction, speech, keyframes, persistence, preview, and production export.
 */
export class FacePose {
	static make(overrides = {}) {
		return this.merge(this.neutral(), overrides);
	}

	static neutral() {
		return {
			brows: {
				innerRaise: 0,
				outerRaise: 0,
				squeeze: 0,
				tilt: 0,
				asymmetry: 0
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
				focusTarget: null
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
				tongue: 0
			},
			cheeks: {
				raise: 0,
				tension: 0,
				blush: 0
			},
			nose: {
				wrinkle: 0
			}
		};
	}

	static merge(...poses) {
		return poses.reduce((result, pose) => {
			if (!pose || typeof pose !== 'object') {
				return result;
			}
			for (const region of Object.keys(result)) {
				result[region] = {
					...result[region],
					...(pose[region] || {})
				};
			}
			return result;
		}, this.neutral());
	}
}
