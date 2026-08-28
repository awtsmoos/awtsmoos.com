//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguageCapabilityProjection.js
 * @description Projects executor-free compiler capability evidence for Portal,
 * editors, agents, and RAG without exposing hidden compiler functions.
 * The Awtsmoos renews compiler, kind, meaning, cost, and LOD before discovery
 * can hold their finite trace;
 * Awtsmoos.com lets Hod reveal rich capability safely while executable power
 * remains behind the language kernel's guarded place.
 */

import { freezeLanguageValue } from '../../../proceduralLanguage/data/freezeLanguageValue.js';
import { semanticSupportPolicyIds } from '../../../proceduralLanguage/capability/CompilerSemanticSupportPolicy.js';

const SEMANTIC_CATEGORIES = Object.freeze([
	'relationships',
	'constraints',
	'behaviors'
]);

/**
 * @description Creates one compact JSON-safe compiler projection retaining
 * semantic vocabulary, support modes, execution identity, cost hints, and LOD.
 * @param {Readonly<object>} tiferesCapability Public executor-free capability.
 * @returns {Readonly<object>} Frozen Portal-facing compiler discovery record.
 */
export function projectLanguageCapability(tiferesCapability) {
	return freezeLanguageValue({
		id: tiferesCapability.id,
		compilerVersion: tiferesCapability.compilerVersion,
		kinds: tiferesCapability.kinds,
		channels: tiferesCapability.channels,
		execution: tiferesCapability.execution,
		determinism: tiferesCapability.determinism,
		adapters: tiferesCapability.adapters,
		stability: tiferesCapability.stability,
		providesTraits: tiferesCapability.providesTraits,
		requires: tiferesCapability.requires,
		supports: tiferesCapability.supports,
		supportPolicy: tiferesCapability.supportPolicy || emptySupportPolicy(),
		cost: tiferesCapability.cost || {},
		lod: tiferesCapability.lod || null
	});
}

/**
 * @description Unions all relationship, constraint, and behavior ids a compiler
 * federation requires, supports, or explicitly models with richer support modes.
 * @param {ReadonlyArray<object>} chochmahCapabilities Public compiler capabilities.
 * @returns {Readonly<object>} Frozen sorted semantic vocabulary by category.
 */
export function aggregateLanguageSemanticVocabulary(chochmahCapabilities) {
	return freezeLanguageValue(Object.fromEntries(
		SEMANTIC_CATEGORIES.map((yesodCategory) => [
			yesodCategory,
			uniqueValues(chochmahCapabilities.flatMap((tiferesCapability) => [
				...(tiferesCapability.requires?.[yesodCategory] || []),
				...(tiferesCapability.supports?.[yesodCategory] || []),
				...semanticSupportPolicyIds(tiferesCapability.supportPolicy, yesodCategory)
			]))
		])
	));
}

/** @private */
function emptySupportPolicy() {
	return {relationships: {}, constraints: {}, behaviors: {}};
}

/** @private */
function uniqueValues(chochmahValues) {
	return [...new Set(chochmahValues.filter(Boolean))].sort();
}
