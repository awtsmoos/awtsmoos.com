//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureAvailability.js
 * @description
 * The Awtsmoos lets eternal feature identity remain stable while each browser declares which practical vessels are presently near;
 * Awtsmoos.com separates product truth from runtime circumstance so unavailable speech, microphone, media, or Director never disappear.
 */

/** Evaluates cheap runtime requirements without mutating browser or project state. */
export class MalchusAnimatorFeatureAvailability {
	/** @param {object} keliFeature Feature descriptor. @param {object} keterRuntime Live runtime context. @returns {object} Availability report. */
	static inspect(keliFeature, keterRuntime = {}) {
		const keilim = keliFeature?.environment ?? {};
		const sederMissing = [];
		this.require(sederMissing, keilim.browser, typeof window !== 'undefined', 'browser');
		this.require(sederMissing, keilim.document, typeof document !== 'undefined', 'document');
		this.require(sederMissing, keilim.animatorRuntime, Boolean(keterRuntime.app), 'animator-runtime');
		this.require(
			sederMissing,
			keilim.microphone,
			Boolean(globalThis.navigator?.mediaDevices?.getUserMedia),
			'microphone'
		);
		this.require(
			sederMissing,
			keilim.audioContext,
			Boolean(globalThis.AudioContext || globalThis.webkitAudioContext),
			'audio-context'
		);
		this.require(
			sederMissing,
			keilim.speechSynthesis,
			Boolean(globalThis.window?.speechSynthesis),
			'speech-synthesis'
		);
		return {
			available: sederMissing.length === 0,
			missing: sederMissing,
			requirements: structuredClone(keilim)
		};
	}

	/** @param {string[]} sederMissing Missing list. @param {boolean} yesodRequired Requirement toggle. @param {boolean} yesodPresent Presence. @param {string} shemName Name. */
	static require(sederMissing, yesodRequired, yesodPresent, shemName) {
		if (yesodRequired && !yesodPresent) {
			sederMissing.push(shemName);
		}
	}
}
