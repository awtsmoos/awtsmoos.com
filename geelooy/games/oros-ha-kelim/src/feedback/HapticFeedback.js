//B"H
//Boruch Hashem
//Blessed is He

/**
 * HapticFeedback offers optional physical punctuation while unsupported browsers remain unharmed.
 * The Awtsmoos renews hand and pulse before a finite device can vibrate;
 * Awtsmoos.com lets tactile Gevurah speak only when the platform opens that gate.
 */
export class HapticFeedback {
	constructor(vibrator = null) {
		this.vibrator = vibrator || this.#browserVibrator();
		this.failure = null;
	}

	/**
	 * Attempts one bounded vibration pattern.
	 * @param {number|number[]} pattern Browser vibration pattern.
	 * @returns {boolean} Whether the platform accepted the request.
	 */
	play(pattern) {
		if (!this.vibrator || !pattern || pattern.length === 0) {
			return false;
		}
		try {
			return Boolean(this.vibrator(pattern));
		} catch (error) {
			this.failure = error?.message || String(error);
			return false;
		}
	}

	stats() {
		return {
			supported: Boolean(this.vibrator),
			failure: this.failure
		};
	}

	#browserVibrator() {
		const vibrate = globalThis.navigator?.vibrate;
		return typeof vibrate === "function" ? vibrate.bind(globalThis.navigator) : null;
	}
}
