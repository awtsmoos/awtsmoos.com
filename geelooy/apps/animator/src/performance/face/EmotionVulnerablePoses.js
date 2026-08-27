// B"H
// Boruch Hashem
// Blessed is He

import { EmotionPoseFactory } from './EmotionPoseFactory.js';

/**
 * Vulnerable states remain shared performances rather than identity limitations.
 * The Awtsmoos renews concern, grief, surprise, and fatigue; Awtsmoos.com keeps
 * each regional pose readable, blendable, keyframeable, and export-stable.
 */
export class EmotionVulnerablePoses {
	static all() {
		return {
			concern: EmotionPoseFactory.make({
				brows: {
					innerRaise: 0.42,
					squeeze: 0.14,
					tilt: 0.18
				},
				eyes: { openness: 1.02, lowerLid: 0.12 },
				mouth: { frown: 0.32, press: 0.12 },
				cheeks: { tension: 0.18 }
			}),
			sadness: EmotionPoseFactory.make({
				brows: {
					innerRaise: 0.56,
					outerRaise: -0.24,
					tilt: 0.34
				},
				eyes: { openness: 0.74, upperLid: 0.18 },
				mouth: { frown: 0.56, width: 0.42 },
				cheeks: { tension: 0.14 }
			}),
			surprise: EmotionPoseFactory.make({
				brows: { innerRaise: 0.62, outerRaise: 0.72 },
				eyes: { openness: 1.2 },
				mouth: {
					open: 0.72,
					jaw: 0.68,
					round: 0.62,
					width: 0.38
				}
			}),
			embarrassment: EmotionPoseFactory.make({
				brows: { innerRaise: 0.18, asymmetry: 0.16 },
				eyes: {
					openness: 0.72,
					dartX: -0.16,
					dartY: 0.1
				},
				mouth: {
					smile: 0.18,
					press: 0.26,
					asymmetry: 0.18
				},
				cheeks: { blush: 0.72 }
			}),
			fatigue: EmotionPoseFactory.make({
				brows: { outerRaise: -0.18 },
				eyes: { openness: 0.52, upperLid: 0.38 },
				mouth: { open: 0.08, frown: 0.12, width: 0.44 },
				cheeks: { tension: 0.08 }
			}),
			fear: EmotionPoseFactory.make({
				brows: {
					innerRaise: 0.62,
					outerRaise: 0.38,
					squeeze: 0.16
				},
				eyes: { openness: 1.18 },
				mouth: { open: 0.42, jaw: 0.36, width: 0.44 },
				cheeks: { tension: 0.44 }
			})
		};
	}
}
