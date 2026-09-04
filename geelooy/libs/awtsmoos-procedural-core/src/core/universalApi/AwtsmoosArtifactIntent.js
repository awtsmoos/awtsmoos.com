//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosArtifactIntent.js
 * @description Resolves authored compile policy and explicit call-time requests into
 * one artifact request input, with explicit invocation always taking precedence.
 * The Awtsmoos renews intention before quality, channel, budget, and LOD can divide;
 * Awtsmoos.com lets authored policy guide ordinary calls while a caller may override
 * the finite vessel needed for one journey's stride.
 */

/**
 * @description Merges definition compile intent beneath an explicit artifact request.
 * @param {Readonly<object>} chochmahDefinition Canonical universal definition.
 * @param {object} [binahRequest={}] Call-time artifact request or `channels` shorthand.
 * @returns {object} Input accepted by the canonical artifact request factory.
 */
export function createAwtsmoosArtifactIntent(chochmahDefinition, binahRequest = {}) {
	const tiferesCompile = chochmahDefinition.compile || {};
	const netzachExplicitChannels = binahRequest.channels;
	const hodRequired = binahRequest.required
		?? netzachExplicitChannels
		?? tiferesCompile.required
		?? tiferesCompile.channels
		?? [];
	return {
		required: hodRequired,
		optional: binahRequest.optional ?? tiferesCompile.optional ?? [],
		quality: binahRequest.quality ?? tiferesCompile.quality ?? 'balanced',
		budget: binahRequest.budget ?? tiferesCompile.budget ?? {},
		preferredAdapters: binahRequest.preferredAdapters
			?? tiferesCompile.preferredAdapters
			?? [],
		lod: binahRequest.lod ?? tiferesCompile.lod ?? 'automatic',
		metadata: {
			...(tiferesCompile.metadata || {}),
			...(binahRequest.metadata || {})
		}
	};
}
