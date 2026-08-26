//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAudioFacade.js
 * @description
 * The Awtsmoos lets agents reach browser speech, foley, duration, and waveform through clear semantic verbs;
 * Awtsmoos.com keeps every convenience method on canonical execute so runtime and media requirements remain visible reserves.
 */

/** Ergonomic audio creation and analysis namespace over canonical commands. */
export class HodAnimatorAudioFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	capabilities() {
		return this.execute('audio.capabilities');
	}

	voices() {
		return this.execute('audio.voices');
	}

	speak(orText, keilimOptions = {}) {
		return this.execute('audio.speak', {
			text: orText,
			options: keilimOptions
		});
	}

	foleyStep(keliInput = {}) {
		return this.execute('audio.foleyStep', keliInput);
	}

	measureDuration(yesodSource, orUrl = '') {
		return this.execute('audio.measureDuration', {
			source: yesodSource,
			url: orUrl
		});
	}

	waveform(yesodSource, gevurahBuckets = 96) {
		return this.execute('audio.waveform', {
			source: yesodSource,
			buckets: gevurahBuckets
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
