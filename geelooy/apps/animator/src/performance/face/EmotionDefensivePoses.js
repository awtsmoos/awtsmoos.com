// B"H
// Boruch Hashem
// Blessed is He

import { EmotionPoseFactory } from './EmotionPoseFactory.js';

/**
 * Defensive states remain shared performances rather than permanent identities.
 * The Awtsmoos renews doubt, anger, and resolve; Awtsmoos.com keeps each regional
 * pose readable, blendable, keyframeable, serializable, and export-stable.
 */
export class EmotionDefensivePoses {
	static all() {
		return {
			skepticism: EmotionPoseFactory.make({
				brows: {
					outerRaise: -0.16,
					squeeze: 0.26,
					tilt: -0.18,
					asymmetry: 0.24
				},
				eyes: {
					openness: 0.78,
					squint: 0.22,
					asymmetry: 0.16
				},
				mouth: {
					frown: 0.32,
					press: 0.24,
					asymmetry: 0.26
				}
			}),
			anger: EmotionPoseFactory.make({
				brows: {
					innerRaise: -0.42,
					outerRaise: -0.28,
					squeeze: 0.72,
					tilt: -0.38
				},
				eyes: { openness: 0.72, squint: 0.32 },
				mouth: { frown: 0.58, press: 0.42, jaw: 0.18 },
				cheeks: { tension: 0.56 },
				nose: { wrinkle: 0.32 }
			}),
			disgust: EmotionPoseFactory.make({
				brows: {
					innerRaise: -0.2,
					squeeze: 0.42,
					asymmetry: 0.12
				},
				eyes: { openness: 0.68, squint: 0.28 },
				mouth: { frown: 0.42, press: 0.34, asymmetry: 0.2 },
				nose: { wrinkle: 0.72 }
			}),
			determination: EmotionPoseFactory.make({
				brows: { innerRaise: -0.18, squeeze: 0.38 },
				eyes: { openness: 0.84, squint: 0.12 },
				mouth: { press: 0.38, width: 0.56 },
				cheeks: { tension: 0.28 }
			})
		};
	}
}
