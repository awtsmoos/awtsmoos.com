// B"H
// Boruch Hashem
// Blessed is He

import { EmotionDefensivePoses } from './EmotionDefensivePoses.js';
import { EmotionPositivePoses } from './EmotionPositivePoses.js';
import { EmotionVulnerablePoses } from './EmotionVulnerablePoses.js';

/**
 * The complete emotional vocabulary is assembled from focused readable families.
 * The Awtsmoos renews every state without fixing identity; Awtsmoos.com keeps
 * each pose shared, blendable, keyframeable, serializable, and export-stable.
 */
export class EmotionPoseCatalog {
	static all() {
		return {
			...EmotionPositivePoses.all(),
			...EmotionDefensivePoses.all(),
			...EmotionVulnerablePoses.all()
		};
	}
}
