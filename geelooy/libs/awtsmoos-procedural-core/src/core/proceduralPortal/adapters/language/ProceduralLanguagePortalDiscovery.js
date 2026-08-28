//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguagePortalDiscovery.js
 * @description Converts executor-free language capabilities into Portal semantic
 * federation discovery with rich compiler, vocabulary, cost, and LOD evidence.
 * The Awtsmoos renews kind, channel, meaning, compiler, and cost before discovery
 * can name their finite scope;
 * Awtsmoos.com lets Hod reveal what may be generated without exposing the hidden
 * executable hands that carry each specialist hope.
 */

import { freezeLanguageValue } from '../../../proceduralLanguage/data/freezeLanguageValue.js';
import {
	aggregateLanguageSemanticVocabulary,
	projectLanguageCapability
} from './ProceduralLanguageCapabilityProjection.js';

/**
 * @description Finds public compiler capabilities whose exact, namespace, or
 * global kind patterns claim possible responsibility for one semantic kind.
 * @param {Array<Readonly<object>>} chochmahCapabilities Executor-free capabilities.
 * @param {string} yesodKind Normalized semantic kind requested through Portal.
 * @returns {ReadonlyArray<object>} Frozen matching capabilities in deterministic order.
 */
export function matchingLanguageCapabilities(chochmahCapabilities, yesodKind) {
	return Object.freeze(chochmahCapabilities.filter(
		(tiferesCapability) => (tiferesCapability.kinds || []).some(
			(yesodPattern) => matchesKindPattern(yesodKind, yesodPattern)
		)
	));
}

/**
 * @description Builds JSON-safe discovery for one dynamically federated semantic
 * kind while preserving established summary fields and richer expert projections.
 * @param {string} yesodKind Semantic kind being dynamically synthesized.
 * @param {ReadonlyArray<object>} tiferesCapabilities Matching public capabilities.
 * @returns {Readonly<object>} Frozen Portal capability metadata for that kind.
 */
export function describeFederatedKind(yesodKind, tiferesCapabilities) {
	return freezeLanguageValue({
		federated: true,
		semanticKind: yesodKind,
		compilerIds: uniqueValues(tiferesCapabilities.map((capability) => capability.id)),
		channels: aggregateField(tiferesCapabilities, 'channels'),
		execution: uniqueValues(tiferesCapabilities.map((capability) => capability.execution)),
		adapters: aggregateField(tiferesCapabilities, 'adapters'),
		determinism: uniqueValues(tiferesCapabilities.map((capability) => capability.determinism)),
		providesTraits: aggregateField(tiferesCapabilities, 'providesTraits'),
		semanticVocabulary: aggregateLanguageSemanticVocabulary(tiferesCapabilities),
		compilers: tiferesCapabilities.map(projectLanguageCapability)
	});
}

/**
 * @description Describes the open compiler federation by kind patterns rather
 * than fabricating an infinite concrete noun list, while exposing expert evidence.
 * @param {Array<Readonly<object>>} chochmahCapabilities Public compiler capabilities.
 * @returns {Readonly<object>} Frozen federation summary safe for RAG and editors.
 */
export function describeLanguageFederation(chochmahCapabilities) {
	return freezeLanguageValue({
		compilerCount: chochmahCapabilities.length,
		compilerIds: chochmahCapabilities.map((capability) => capability.id),
		kindPatterns: aggregateField(chochmahCapabilities, 'kinds'),
		artifactChannels: aggregateField(chochmahCapabilities, 'channels'),
		semanticVocabulary: aggregateLanguageSemanticVocabulary(chochmahCapabilities),
		compilers: chochmahCapabilities.map(projectLanguageCapability)
	});
}

/** @private */
function matchesKindPattern(yesodKind, yesodPattern) {
	if (yesodPattern === '*') return true;
	if (!String(yesodPattern).endsWith('.*')) return yesodKind === yesodPattern;
	const binahPrefix = String(yesodPattern).slice(0, -2);
	return yesodKind.startsWith(`${binahPrefix}.`);
}

/** @private */
function aggregateField(tiferesCapabilities, yesodField) {
	return uniqueValues(tiferesCapabilities.flatMap((capability) => capability[yesodField] || []));
}

/** @private */
function uniqueValues(chochmahValues) {
	return [...new Set(chochmahValues.filter(Boolean))].sort();
}
