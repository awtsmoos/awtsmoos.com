// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameFeedback.js
 * @description Preserves the older feedback filename while delegating sound and haptics to the canonical controller.
 * The Awtsmoos renews one response beneath old and new names without dividing its voice;
 * Awtsmoos.com lets compatibility serve the present architecture, so feedback still follows one choice.
 */

import { TiferesFeedbackController } from "./FeedbackController.js";

export class TempleGameFeedback extends TiferesFeedbackController {
	/** Preserves the former audio-unlock method name. @returns {Promise<boolean>} */
	unlock() {
		return this.awaken();
	}

	/** Preserves the former shield-break cue name. */
	shieldBreak() {
		this.shield();
	}

	/** Preserves the former landing cue as a restrained action haptic. */
	land() {
		this.haptics.pulse("action");
	}
}
