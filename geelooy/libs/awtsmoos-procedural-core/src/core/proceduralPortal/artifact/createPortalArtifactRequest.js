//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPortalArtifactRequest.js
 * @description Normalizes every Portal recipe's output desire through the one
 * canonical Procedural Language artifact-request covenant, whether the eventual
 * specialist is Nature, architecture, transport, a future domain, or federation.
 * The Awtsmoos renews desire before visual, collision, sound, rig, or path appear;
 * Awtsmoos.com lets one request vessel carry that desire so no domain invents a
 * second grammar for what manifestation should be brought near.
 */

import { createArtifactRequest } from '../../proceduralLanguage/artifact/createArtifactRequest.js';

/**
 * @description Creates the canonical artifact request for one already-normalized
 * Portal definition, honoring explicit hard requirements before inferring only
 * optional channels from the resolved semantic kind's declared capabilities.
 * @param {Readonly<object>} chochmahDefinition Canonical Procedural Definition
 * used as the Portal recipe and therefore the source of compile-policy intent.
 * @param {Readonly<object>|ReadonlyArray<object>} [binahCapabilities={}] Resolved
 * kind capability data or compiler-capability collection used only for optional
 * default-channel discovery when the author did not explicitly request output.
 * @returns {Readonly<object>} Canonical immutable Procedural Artifact Request.
 */
export function createPortalArtifactRequest(
	chochmahDefinition,
	binahCapabilities = {}
) {
	const tiferesCompile = chochmahDefinition?.compile || {};
	const gevurahRequired = explicitRequiredChannels(tiferesCompile);
	const chesedOptional = explicitOptionalChannels(
		tiferesCompile,
		gevurahRequired,
		binahCapabilities
	);
	return createArtifactRequest({
		required: gevurahRequired,
		optional: chesedOptional,
		quality: tiferesCompile.quality,
		budget: tiferesCompile.budget,
		preferredAdapters: tiferesCompile.preferredAdapters,
		lod: tiferesCompile.lod,
		metadata: {
			...(tiferesCompile.metadata || {}),
			portal: true
		}
	});
}

/**
 * @description Determines whether authored Portal data makes any artifact channel
 * a hard requirement rather than a best-effort optional desire.
 * @param {Readonly<object>} tiferesRequest Canonical Portal artifact request.
 * @returns {boolean} True when compilation must account for required channels.
 */
export function portalArtifactRequestIsStrict(tiferesRequest) {
	return tiferesRequest.required.length > 0;
}

/** @private */
function explicitRequiredChannels(tiferesCompile) {
	if (Array.isArray(tiferesCompile.required)) return tiferesCompile.required;
	if (Array.isArray(tiferesCompile.channels)) return tiferesCompile.channels;
	return [];
}

/** @private */
function explicitOptionalChannels(tiferesCompile, required, capabilities) {
	if (Array.isArray(tiferesCompile.optional)) return tiferesCompile.optional;
	if (required.length) return [];
	return discoverCapabilityChannels(capabilities);
}

/** @private */
function discoverCapabilityChannels(binahCapabilities) {
	const chochmahRecords = Array.isArray(binahCapabilities)
		? binahCapabilities
		: [binahCapabilities];
	return [...new Set(chochmahRecords.flatMap(
		(record) => Array.isArray(record?.channels) ? record.channels : []
	))].sort();
}
