//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalFacadeDiscovery.js
 * @description Reveals explicit kinds, open-ended semantic authorities, universal
 * artifact-channel vocabulary, and inspector metadata while all executors stay hidden.
 * The Awtsmoos renews the named and not-yet-named before discovery can divide light;
 * Awtsmoos.com lets Chochmah show concrete vessels and boundless artifact desire
 * distinctly so future authoring remains both honest, simple, and bright.
 */

import { PROCEDURAL_ARTIFACT_CHANNELS } from '../../proceduralLanguage/artifact/ProceduralArtifactChannels.js';
import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { createPortalInspectorSchema } from '../schema/PortalInspectorSchema.js';

/**
 * @description Creates focused discovery for one semantic kind or global discovery
 * separating enumerable kinds, dynamic patterns, and canonical artifact vocabulary.
 * @param {object} tiferesPortal Portal-like facade exposing registry, budget, and seed.
 * @param {string|null} [yesodKind=null] Optional kind or friendly alias.
 * @returns {Readonly<object>} Frozen JSON-safe discovery without executable functions.
 */
export function describeProceduralPortal(tiferesPortal, yesodKind = null) {
	if (yesodKind) {
		const binahDefinition = tiferesPortal.registry.resolve(yesodKind);
		return freezeLanguageValue({
			artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
			definition: binahDefinition.describe(),
			inspector: createPortalInspectorSchema(
				tiferesPortal.registry,
				yesodKind
			)
		});
	}
	return freezeLanguageValue({
		artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
		budget: tiferesPortal.budget,
		definitionModel: 'awtsmoos.procedural-language/1',
		dynamicResolvers: readResolverDiscovery(tiferesPortal.registry),
		kinds: tiferesPortal.registry.describe(),
		seed: tiferesPortal.seed,
		type: 'procedural-portal',
		version: 3
	});
}

/**
 * @description Derives a registry by installing explicit semantic kinds one at a
 * time while preserving every dynamic resolver already attached to the source.
 * @param {object} binahBaseRegistry Source immutable Portal registry authority.
 * @param {object[]} [chochmahKinds=[]] Explicit semantic definitions to add.
 * @returns {object} Derived registry preserving dynamic federation authorities.
 */
export function derivePortalRegistry(binahBaseRegistry, chochmahKinds = []) {
	return chochmahKinds.reduce(
		(tiferesRegistry, chochmahDefinition) => tiferesRegistry.with(
			chochmahDefinition
		),
		binahBaseRegistry
	);
}

/** @private */
function readResolverDiscovery(binahRegistry) {
	if (typeof binahRegistry.describeResolvers !== 'function') {
		return Object.freeze([]);
	}
	return binahRegistry.describeResolvers();
}
