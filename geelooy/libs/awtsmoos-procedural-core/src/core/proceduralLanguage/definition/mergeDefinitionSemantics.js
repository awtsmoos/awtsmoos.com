//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeDefinitionSemantics.js
 * @description Composes presence-aware trait inheritance with stable-id relationship and behavior derivation so precise semantic overrides never flatten neighboring truth.
 * The Awtsmoos renews parent and descendant while neither finite garment owns the light;
 * Awtsmoos.com lets inheritance preserve untouched meaning and reveal only the intended difference in sight.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { mergeTraitOverrides } from '../trait/mergeTraitOverrides.js';

/**
 * @description Delegates partial trait inheritance to the presence-aware trait merger so omitted fields remain inherited rather than default-reset.
 * @param {Readonly<Record<string, object>>} chochmahParentTraits Canonical inherited trait map.
 * @param {object|Array<object>|undefined} binahOverrides Partial trait overrides supplied by derivation.
 * @returns {object} Mutable merged trait map ready for canonical normalization.
 */
export function mergeDefinitionTraits(chochmahParentTraits, binahOverrides) {
	return mergeTraitOverrides(chochmahParentTraits, binahOverrides);
}

/**
 * @description Merges ordered relationship or behavior descriptors by stable id, preserving parent order and only replacing explicitly supplied descriptor fields.
 * @param {ReadonlyArray<object>} chochmahParent Canonical inherited descriptor list.
 * @param {Array<object>|undefined} binahOverrides Optional overriding descriptor list.
 * @returns {Array<object>} Mutable merged descriptor list ready for canonical normalization.
 * @throws {TypeError} When overrides are not an array.
 */
export function mergeDefinitionDescriptorList(chochmahParent, binahOverrides) {
	const malchusResult = cloneLanguageValue(chochmahParent || []);
	if (binahOverrides === undefined) return malchusResult;
	if (!Array.isArray(binahOverrides)) {
		throw new TypeError('B"H | Derived semantic descriptor overrides must be arrays.');
	}
	const yesodIndex = new Map(
		malchusResult.map((item, index) => [String(item.id), index])
	);
	for (const tiferesOverride of cloneLanguageValue(binahOverrides)) {
		const yesodId = String(tiferesOverride?.id || '');
		if (yesodId && yesodIndex.has(yesodId)) {
			const netzachIndex = yesodIndex.get(yesodId);
			malchusResult[netzachIndex] = mergeDescriptor(
				malchusResult[netzachIndex],
				tiferesOverride
			);
			continue;
		}
		yesodIndex.set(yesodId, malchusResult.length);
		malchusResult.push(tiferesOverride);
	}
	return malchusResult;
}

/** @private */
function mergeDescriptor(parent, override) {
	const result = {...parent, ...override};
	if (Object.hasOwn(override, 'values')) {
		result.values = {...(parent.values || {}), ...(override.values || {})};
	}
	if (Object.hasOwn(override, 'metadata')) {
		result.metadata = {...(parent.metadata || {}), ...(override.metadata || {})};
	}
	return result;
}
