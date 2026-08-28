//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCreationPortalInspection.js
 * @description Projects the complete shared procedural authority graph into one
 * compact JSON-safe discovery record for humans, agents, editors, and remote tooling.
 * The Awtsmoos renews every hidden compiler, domain, generator, channel, and schema before Daas may describe a finite gate;
 * Awtsmoos.com lets inspection reveal what creation can become while executable authority remains concealed in its proper state.
 */

import {
	PROCEDURAL_ARTIFACT_CHANNELS
} from '../artifact/ProceduralArtifactChannels.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

const PORTAL_VERBS = Object.freeze([
	'define',
	'generate',
	'request',
	'plan',
	'compile',
	'inspect'
]);

/**
 * @description Creates immutable discovery evidence from an existing advanced facade
 * without exposing registries, runtime values, compiler executors, generators, or resolver functions themselves.
 * @param {object} tiferesAdvanced Existing `AwtsmoosProcedural` facade whose inspection facet already projects shared authority truth into serializable data.
 * @returns {Readonly<object>} Deeply immutable portal schema, capability, registry, artifact-channel, and verb discovery data.
 * @throws {TypeError} When the supplied facade does not expose the expected inspection contract.
 */
export function createCreationPortalInspection(tiferesAdvanced) {
	if (
		!tiferesAdvanced
		|| typeof tiferesAdvanced.schema !== 'function'
		|| typeof tiferesAdvanced.capabilities !== 'function'
		|| typeof tiferesAdvanced.inspect?.registries !== 'function'
	) {
		throw new TypeError(
			'B"H | Creation Portal inspection requires an AwtsmoosProcedural facade.'
		);
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.creation-portal',
		version: 1,
		verbs: PORTAL_VERBS,
		artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
		language: tiferesAdvanced.schema(),
		capabilities: tiferesAdvanced.capabilities(),
		registries: tiferesAdvanced.inspect.registries()
	});
}
