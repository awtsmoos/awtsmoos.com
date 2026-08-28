//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerSemanticSupportPolicy.js
 * @description Normalizes optional per-semantic-id support modes without replacing
 * the older open vocabulary lists that already let compilers advertise meaning.
 * The Awtsmoos renews relation, constraint, behavior, and every mode before one
 * compiler can claim its finite way;
 * Awtsmoos.com lets Binah distinguish consume from preserve and enforce from
 * defer while unknown future meanings remain free to enter another day.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	normalizeCapabilityList,
	normalizeCapabilityText
} from './CompilerCapabilityNormalization.js';

export const COMPILER_SEMANTIC_SUPPORT_MODES = Object.freeze([
	'consume',
	'validate',
	'produce',
	'preserve',
	'defer',
	'enforce'
]);

export const COMPILER_SEMANTIC_SUPPORT_CATEGORIES = Object.freeze([
	'relationships',
	'constraints',
	'behaviors'
]);

/**
 * @description Converts optional semantic-mode authoring into immutable category
 * maps while leaving omitted policy empty for complete legacy compatibility.
 * @param {object} [chochmahPolicy={}] Category maps from semantic ids to support-mode arrays.
 * @returns {Readonly<object>} Frozen relationship, constraint, and behavior policy maps.
 * @throws {TypeError|RangeError} When category maps, semantic ids, or modes are invalid.
 */
export function normalizeCompilerSemanticSupportPolicy(chochmahPolicy = {}) {
	assertRecord(chochmahPolicy, 'semantic support policy');
	return freezeLanguageValue(Object.fromEntries(
		COMPILER_SEMANTIC_SUPPORT_CATEGORIES.map((yesodCategory) => [
			yesodCategory,
			normalizeCategoryPolicy(chochmahPolicy[yesodCategory], yesodCategory)
		])
	));
}

/**
 * @description Returns deterministic semantic ids explicitly described by one
 * policy category, useful for matching and discovery without exposing mutation.
 * @param {Readonly<object>} tiferesPolicy Canonical semantic support policy.
 * @param {string} yesodCategory Stable support category name.
 * @returns {ReadonlyArray<string>} Sorted explicitly-modeled semantic ids.
 */
export function semanticSupportPolicyIds(tiferesPolicy, yesodCategory) {
	return Object.freeze(Object.keys(tiferesPolicy?.[yesodCategory] || {}).sort());
}

/** @private */
function normalizeCategoryPolicy(chochmahCategory = {}, yesodCategory) {
	assertRecord(chochmahCategory, `${yesodCategory} support policy`);
	const binahEntries = Object.entries(chochmahCategory).map(
		([yesodId, netzachModes]) => [
			normalizeCapabilityText(yesodId, `${yesodCategory} semantic id`),
			normalizeSupportModes(netzachModes, yesodId)
		]
	);
	return Object.fromEntries(binahEntries.sort(([left], [right]) => left.localeCompare(right)));
}

/** @private */
function normalizeSupportModes(chochmahModes, yesodId) {
	const tiferesModes = normalizeCapabilityList(chochmahModes, `support mode for ${yesodId}`);
	for (const yesodMode of tiferesModes) {
		if (!COMPILER_SEMANTIC_SUPPORT_MODES.includes(yesodMode)) {
			throw new RangeError(`B"H | Unknown compiler semantic support mode: ${yesodMode}`);
		}
	}
	return tiferesModes;
}

/** @private */
function assertRecord(chochmahValue, yesodName) {
	if (!chochmahValue || typeof chochmahValue !== 'object' || Array.isArray(chochmahValue)) {
		throw new TypeError(`B"H | Compiler ${yesodName} must be an object.`);
	}
}
