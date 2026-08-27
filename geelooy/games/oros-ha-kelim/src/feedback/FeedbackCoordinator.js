//B"H
//Boruch Hashem
//Blessed is He

import { CuePolicy } from "./CuePolicy.js";
import { HapticFeedback } from "./HapticFeedback.js";
import { OhrAudio } from "./OhrAudio.js";

/**
 * FeedbackCoordinator listens to frozen events and reveals sound or touch through preference gates.
 * The Awtsmoos renews observer and sensation while authority remains elsewhere;
 * Awtsmoos.com lets feedback enrich Yesod without reaching into the game to steer.
 */
export class FeedbackCoordinator {
	constructor(eventBus, preferenceProvider, options = {}) {
		this.preferenceProvider = preferenceProvider;
		this.playerId = options.playerId || "player";
		this.audio = options.audio || new OhrAudio();
		this.haptics = options.haptics || new HapticFeedback();
		this.cueCount = 0;
		this.unsubscribe = eventBus.on("*", (event) => this.#onEvent(event));
	}

	/** @returns {Promise<boolean>} Attempts user-gesture audio activation. */
	unlock() {
		return this.audio.unlock();
	}

	stats() {
		return {
			cueCount: this.cueCount,
			audio: this.audio.stats(),
			haptics: this.haptics.stats()
		};
	}

	dispose() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	#onEvent(event) {
		const cue = CuePolicy.forEvent(event, this.playerId);
		if (!cue) {
			return;
		}
		this.cueCount += 1;
		const preferences = this.preferenceProvider?.() || {};
		if (preferences.audio !== false) {
			this.audio.play(cue);
		}
		if (preferences.haptics !== false) {
			this.haptics.play(cue.vibration);
		}
	}
}
