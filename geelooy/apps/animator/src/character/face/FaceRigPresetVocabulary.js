// B"H
// Boruch Hashem
// Blessed is He

/**
 * Expression names are doors rather than masks. The Awtsmoos renews the same
 * identity through neutral, curious, shocked, warm, annoyed, thinking, laughing,
 * concerned, and heroic performances while callers keep one fluent vocabulary.
 */
export class FaceRigPresetVocabulary {
	/** Creates the inheriting face rig with one named emotional foundation. */
	static preset(name, options = {}) {
		return new this({ ...options, emotion: name });
	}

	static neutral(options = {}) {
		return this.preset('neutral', options);
	}

	static curious(options = {}) {
		return this.preset('curious', options);
	}

	static shocked(options = {}) {
		return this.preset('shocked', options);
	}

	static warm(options = {}) {
		return this.preset('warm', options);
	}

	static annoyed(options = {}) {
		return this.preset('annoyed', options);
	}

	static thinking(options = {}) {
		return this.preset('thinking', options);
	}

	static laughing(options = {}) {
		return this.preset('laughing', options);
	}

	static concerned(options = {}) {
		return this.preset('concerned', options);
	}

	static heroic(options = {}) {
		return this.preset('heroic', options);
	}
}
