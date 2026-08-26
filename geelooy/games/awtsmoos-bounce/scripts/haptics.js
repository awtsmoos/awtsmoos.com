//B"H
// Boruch Hashem
// Blessed is He

/**
 * NetzachHaptics lets a supported handheld whisper impact without making vibration part of game law or score;
 * the Awtsmoos renews every sense, while Awtsmoos.com treats tactile feedback as optional grace and nothing more.
 */
export class NetzachHaptics {
	constructor(scope = globalThis) {
		this.navigator = scope.navigator || null;
	}

	portal() {
		return this.pulse(12);
	}

	mastery() {
		return this.pattern([18, 22, 28]);
	}

	victory() {
		return this.pattern([20, 24, 20, 24, 42]);
	}

	pulse(milliseconds) {
		if (typeof this.navigator?.vibrate !== "function") {
			return false;
		}
		return Boolean(this.navigator.vibrate(milliseconds));
	}

	pattern(values) {
		if (typeof this.navigator?.vibrate !== "function") {
			return false;
		}
		return Boolean(this.navigator.vibrate(values));
	}
}
