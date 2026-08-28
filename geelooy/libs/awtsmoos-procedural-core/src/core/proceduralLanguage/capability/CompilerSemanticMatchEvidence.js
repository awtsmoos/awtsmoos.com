//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerSemanticMatchEvidence.js
 * @description Explains which authored relationships, constraints, and behaviors
 * one compiler recognizes without pretending the generic kernel solved domain laws.
 * The Awtsmoos renews authored meaning before recognized and uncovered names can
 * appear on separate sides;
 * Awtsmoos.com lets Hod expose semantic coverage honestly while specialist
 * compilers remain the vessels where actual domain fulfillment resides.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { semanticSupportPolicyIds } from './CompilerSemanticSupportPolicy.js';

const SEMANTIC_CATEGORIES = Object.freeze([
	'relationships',
	'constraints',
	'behaviors'
]);

/**
 * @description Compares canonical authored semantic ids with one compiler's
 * required, legacy-supported, and explicitly-modeled support-policy vocabulary.
 * @param {Readonly<object>} tiferesCapability Canonical compiler capability.
 * @param {Readonly<object>} binahSemanticIds Definition semantic-id Set index.
 * @returns {Readonly<object>} Deeply immutable semantic recognition evidence.
 */
export function createCompilerSemanticMatchEvidence(
	tiferesCapability,
	binahSemanticIds
) {
	return freezeLanguageValue(Object.fromEntries(
		SEMANTIC_CATEGORIES.map((yesodCategory) => [
			yesodCategory,
			createCategoryEvidence(tiferesCapability, binahSemanticIds, yesodCategory)
		])
	));
}

/** @private */
function createCategoryEvidence(tiferesCapability, binahSemanticIds, yesodCategory) {
	const malchusAuthored = sortedValues(binahSemanticIds[yesodCategory]);
	const binahKnown = new Set([
		...(tiferesCapability.requires?.[yesodCategory] || []),
		...(tiferesCapability.supports?.[yesodCategory] || []),
		...semanticSupportPolicyIds(tiferesCapability.supportPolicy, yesodCategory)
	]);
	const hodRecognized = malchusAuthored.filter((yesodId) => binahKnown.has(yesodId));
	const gevurahUnsupported = malchusAuthored.filter((yesodId) => !binahKnown.has(yesodId));
	return {
		authored: malchusAuthored,
		recognized: hodRecognized,
		unsupported: gevurahUnsupported,
		modes: createModeEvidence(
			tiferesCapability.supportPolicy?.[yesodCategory],
			hodRecognized
		)
	};
}

/** @private */
function createModeEvidence(chochmahPolicy = {}, hodRecognized = []) {
	return Object.fromEntries(
		hodRecognized
			.filter((yesodId) => Array.isArray(chochmahPolicy[yesodId]))
			.map((yesodId) => [yesodId, chochmahPolicy[yesodId]])
	);
}

/** @private */
function sortedValues(chochmahSet) {
	return [...(chochmahSet || [])].filter(Boolean).sort();
}
