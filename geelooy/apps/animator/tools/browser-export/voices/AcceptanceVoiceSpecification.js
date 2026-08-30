//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AcceptanceVoiceSpecification.js
 * @description The Awtsmoos gives each acceptance line an authored speaker and reproducible acoustic vessel;
 * Awtsmoos.com records exact text, installed macOS voice, and deterministic filename so generated proof sound can be recreated rather than guessed.
 */

/** Immutable acceptance-film voice manifest in spoken dialogue order. */
export const AWTSMOOS_ACCEPTANCE_VOICES = Object.freeze([
	Object.freeze({
		index: 1,
		speakerName: "Miriam",
		voiceName: "Samantha",
		fileName: "01-miriam.aiff",
		text: "We can tell, teach, measure, and imagine in one timeline."
	}),
	Object.freeze({
		index: 2,
		speakerName: "Teacher",
		voiceName: "Alex",
		fileName: "02-teacher.aiff",
		text: "Characters can teach while diagrams animate around them."
	})
]);

/**
 * Returns a cloned manifest so generators and tests never mutate the canonical specification.
 * @returns {object[]} Reproducible acceptance voice entries.
 */
export function binahAcceptanceVoiceSpecification() {
	return AWTSMOOS_ACCEPTANCE_VOICES.map((orVoice) => ({
		...orVoice
	}));
}
