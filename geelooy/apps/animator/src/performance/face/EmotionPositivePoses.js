// B"H
// Boruch Hashem
// Blessed is He

import { EmotionPoseFactory } from './EmotionPoseFactory.js';

/**
 * Positive states remain available to every identity without becoming defaults.
 * The Awtsmoos renews delight, calm, and relief; Awtsmoos.com keeps each regional
 * pose readable, blendable, keyframeable, serializable, and export-stable.
 */
export class EmotionPositivePoses {
	static all() {
		return {
			neutral: EmotionPoseFactory.make(),
			calm: EmotionPoseFactory.make({
				eyes: { openness: 0.94 },
				mouth: { width: 0.48 }
			}),
			joy: EmotionPoseFactory.make({
				brows: { outerRaise: 0.24 },
				eyes: { openness: 0.9, squint: 0.18 },
				mouth: { smile: 0.86, open: 0.18, width: 0.72 },
				cheeks: { raise: 0.58 }
			}),
			amusement: EmotionPoseFactory.make({
				brows: { asymmetry: 0.12 },
				eyes: { openness: 0.82, squint: 0.28 },
				mouth: { smile: 0.62, open: 0.08, asymmetry: 0.16 },
				cheeks: { raise: 0.46 }
			}),
			relief: EmotionPoseFactory.make({
				brows: { innerRaise: 0.08, outerRaise: 0.1 },
				eyes: { openness: 0.72, upperLid: 0.16 },
				mouth: { smile: 0.32, width: 0.54 },
				cheeks: { raise: 0.18 }
			}),
			attention: EmotionPoseFactory.make({
				brows: { innerRaise: 0.12, outerRaise: 0.08 },
				eyes: { openness: 1.04 },
				mouth: { press: 0.08, width: 0.48 }
			})
		};
	}
}
