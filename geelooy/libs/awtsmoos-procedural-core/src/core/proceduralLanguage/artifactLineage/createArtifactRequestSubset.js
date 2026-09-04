//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createArtifactRequestSubset.js
 * @description Narrows only artifact channels while preserving the existing canonical request's quality, budget, adapter, LOD, and metadata policy.
 * The Awtsmoos renews the request before one stale channel can make every artifact descend anew;
 * Awtsmoos.com keeps required and optional vessels in order, so selective work preserves the policy authors already knew.
 */
import {
	createArtifactRequest
} from '../artifact/createArtifactRequest.js';
import {
	normalizeArtifactChannels
} from '../artifact/ProceduralArtifactChannels.js';

/**
 * @description Selects requested channels while preserving their original required/optional classification and request ordering.
 * @param {object} requestInput Existing canonicalizable ArtifactRequest input.
 * @param {ReadonlyArray<string>} [selectedChannels=[]] Channels proven relevant by artifact-lineage evidence.
 * @returns {Readonly<{required: ReadonlyArray<string>, optional: ReadonlyArray<string>, channels: ReadonlyArray<string>}>} Frozen classified selection.
 */
export function selectArtifactRequestChannels(requestInput = {}, selectedChannels = []) {
	const requestKeter = createArtifactRequest(requestInput);
	const selectedYesod = new Set(normalizeArtifactChannels(selectedChannels));
	const requiredChesed = Object.freeze(
		requestKeter.required.filter((channel) => selectedYesod.has(channel))
	);
	const optionalGevurah = Object.freeze(
		requestKeter.optional.filter((channel) => selectedYesod.has(channel))
	);

	return Object.freeze({
		required: requiredChesed,
		optional: optionalGevurah,
		channels: Object.freeze([...requiredChesed, ...optionalGevurah])
	});
}

/**
 * @description Creates a canonical ArtifactRequest whose only changed dimension is the selected channel subset.
 * @param {object} requestInput Existing canonicalizable ArtifactRequest input.
 * @param {ReadonlyArray<string>} [selectedChannels=[]] Channels to retain.
 * @returns {Readonly<object>} Canonical frozen ArtifactRequest suitable for existing compiler planning and cache authorities.
 */
export function createArtifactRequestSubset(requestInput = {}, selectedChannels = []) {
	const requestKeter = createArtifactRequest(requestInput);
	const selectionTiferes = selectArtifactRequestChannels(requestKeter, selectedChannels);

	return createArtifactRequest({
		required: selectionTiferes.required,
		optional: selectionTiferes.optional,
		quality: requestKeter.quality,
		budget: requestKeter.budget,
		preferredAdapters: requestKeter.preferredAdapters,
		lod: requestKeter.lod,
		metadata: requestKeter.metadata
	});
}
