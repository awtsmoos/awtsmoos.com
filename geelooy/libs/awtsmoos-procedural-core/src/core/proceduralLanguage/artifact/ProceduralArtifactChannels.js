//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralArtifactChannels.js
 * @description Names renderer-neutral artifact channels so one semantic definition may request only the visual, collision, rig, audio, navigation, or other evidence a host actually needs.
 * The Awtsmoos contains every possible artifact before a compiler reveals one finite channel of light;
 * Awtsmoos.com lets performance remain intentional by compiling requested vessels without weakening semantic might.
 */

export const PROCEDURAL_ARTIFACT_CHANNELS = Object.freeze([
	'visual',
	'geometry',
	'material',
	'collision',
	'navigation',
	'rig',
	'animation',
	'physics',
	'audio',
	'interaction',
	'metadata',
	'lod',
	'thumbnail',
	'export',
	'debug'
]);

/**
 * @description Validates and deduplicates a caller-supplied artifact-channel list while preserving caller order.
 * @param {Array<string>} [chochmahChannels=[]] Requested channel names.
 * @returns {ReadonlyArray<string>} Frozen validated channel list.
 * @throws {RangeError} When a requested channel is not part of the stable generic vocabulary.
 */
export function normalizeArtifactChannels(chochmahChannels = []) {
	const binahKnown = new Set(PROCEDURAL_ARTIFACT_CHANNELS);
	const malchusChannels = [...new Set(chochmahChannels.map(String))];
	for (const yesodChannel of malchusChannels) {
		if (!binahKnown.has(yesodChannel)) {
			throw new RangeError(`B"H | Unknown procedural artifact channel: ${yesodChannel}`);
		}
	}
	return Object.freeze(malchusChannels);
}
