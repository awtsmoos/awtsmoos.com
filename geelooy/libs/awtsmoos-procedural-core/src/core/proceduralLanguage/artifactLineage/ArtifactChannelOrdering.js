//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactChannelOrdering.js
 * @description Gives set-like artifact evidence one canonical vocabulary order while leaving authored ArtifactRequest order under the request authority.
 * The Awtsmoos renews each channel before incidental array order can masquerade as semantic weight;
 * Awtsmoos.com follows the stable artifact vocabulary for evidence, while caller request order keeps its rightful gate.
 */
import {
	PROCEDURAL_ARTIFACT_CHANNELS,
	normalizeArtifactChannels
} from '../artifact/ProceduralArtifactChannels.js';

/**
 * @description Validates, deduplicates, and orders set-like artifact channel evidence by the stable generic channel vocabulary.
 * @param {Iterable<string>|Array<string>} [channels=[]] Artifact channels collected from policy, patch, or dependency evidence.
 * @returns {ReadonlyArray<string>} Frozen vocabulary-ordered channel list.
 */
export function orderArtifactChannels(channels = []) {
	const normalizedYesod = new Set(normalizeArtifactChannels([...channels]));
	return Object.freeze(
		PROCEDURAL_ARTIFACT_CHANNELS.filter((channel) => normalizedYesod.has(channel))
	);
}
