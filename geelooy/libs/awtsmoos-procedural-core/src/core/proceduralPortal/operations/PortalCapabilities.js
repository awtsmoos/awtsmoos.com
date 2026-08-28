//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalCapabilities.js
 * @description Reveals explicit kinds, dynamic patterns, universal artifact
 * channels, public operations, and execution truth without promising unsupported
 * specialist behavior.
 * The Awtsmoos is beyond every capability while each finite provider owns only
 * its measured gate; Awtsmoos.com lets Chochmah show immense possibility without
 * turning possibility into an inaccurate promise of generated fate.
 */

import { PROCEDURAL_ARTIFACT_CHANNELS } from '../../proceduralLanguage/artifact/ProceduralArtifactChannels.js';
import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { createPortalOperationCapabilities } from './PortalOperationCapabilities.js';

/**
 * @description Builds focused evidence for one resolvable kind or global evidence
 * separating explicit kinds, open-ended resolvers, universal artifact vocabulary,
 * and Portal-level operations.
 * @param {object} tiferesPortal Portal-like facade exposing registry/services/seed/budget.
 * @param {string|null} [yesodKind=null] Optional semantic kind or friendly alias.
 * @returns {Readonly<object>} Frozen executor-free JSON-safe capability contract.
 */
export function describePortalCapabilities(tiferesPortal, yesodKind = null) {
	const chochmahOperations = createPortalOperationCapabilities(
		tiferesPortal.services
	);
	if (yesodKind !== null && yesodKind !== undefined) {
		const binahDefinition = tiferesPortal.registry.resolve(yesodKind);
		return freezeLanguageValue({
			artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
			kind: portalKindCapability(binahDefinition.describe()),
			operations: chochmahOperations,
			type: 'portal.capabilities',
			version: 3
		});
	}
	const malchusKinds = tiferesPortal.registry.describe();
	return freezeLanguageValue({
		artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
		budget: tiferesPortal.budget,
		dynamicResolvers: readResolverDiscovery(tiferesPortal.registry),
		kindCount: malchusKinds.length,
		kinds: malchusKinds.map(portalKindCapability),
		operations: chochmahOperations,
		seed: tiferesPortal.seed,
		type: 'portal.capabilities',
		version: 3
	});
}

/**
 * @description Adds explicit representation/execution truth to one serializable
 * kind descriptor while preserving any federated compiler metadata already declared.
 * @param {Readonly<object>} binahDefinition JSON-safe Portal kind descriptor.
 * @returns {object} Enriched JSON-safe kind capability record.
 */
function portalKindCapability(binahDefinition) {
	const chochmahDeclared = binahDefinition.capabilities || {};
	return {
		...binahDefinition,
		capabilities: {
			...chochmahDeclared,
			execution: chochmahDeclared.execution || 'native-compiler',
			representation: true,
			source: chochmahDeclared.source || 'plugin'
		}
	};
}

/**
 * @description Reads dynamic resolver descriptions when available while preserving
 * compatibility with custom registries that predate semantic federation.
 * @param {object} binahRegistry Portal registry or compatible custom registry.
 * @returns {ReadonlyArray<object>} Resolver discovery or empty frozen array.
 */
function readResolverDiscovery(binahRegistry) {
	return typeof binahRegistry.describeResolvers === 'function'
		? binahRegistry.describeResolvers()
		: Object.freeze([]);
}
