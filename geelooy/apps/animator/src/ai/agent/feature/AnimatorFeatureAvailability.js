//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureAvailability.js
 * @description
 * The Awtsmoos lets eternal feature identity remain stable while each runtime declares which vessels are presently near;
 * Awtsmoos.com separates product truth from browser circumstance, so missing microphone or document never makes capability ontology disappear.
 */

/** Evaluates cheap runtime requirements without mutating browser or project state. */
export class MalchusAnimatorFeatureAvailability {
	/** @param {object} keliFeature Feature descriptor. @returns {object} Runtime availability report. */
	static inspect(keliFeature) {
		const keilimRequirements = keliFeature?.environment ?? {};
		const sederMissing = [];
		if (keilimRequirements.browser && typeof window === 'undefined') sederMissing.push('browser');
		if (keilimRequirements.document && typeof document === 'undefined') sederMissing.push('document');
		if (keilimRequirements.microphone && !globalThis.navigator?.mediaDevices?.getUserMedia) sederMissing.push('microphone');
		if (keilimRequirements.audioContext && !globalThis.AudioContext && !globalThis.webkitAudioContext) sederMissing.push('audio-context');
		return {
			available: sederMissing.length === 0,
			missing: sederMissing,
			requirements: structuredClone(keilimRequirements)
		};
	}
}
