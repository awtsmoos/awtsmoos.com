//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeTraitOverrides.js
 * @description Merges partial trait authoring data by property presence so omitted fields inherit instead of being erased by canonical default values.
 * The Awtsmoos renews every quality while inheritance and change remain finite garments around one light;
 * Awtsmoos.com lets one nested value change alone, preserving every untouched constraint, channel, hint, and metadata right.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { assertTraitId } from './createTraitDescriptor.js';

/**
 * @description Applies array or object-map trait overrides onto a parent trait map while merging nested values, editor hints, and metadata only when those fields are explicitly present.
 * @param {Readonly<Record<string, object>>} chochmahParentTraits Canonical inherited trait map.
 * @param {object|Array<object>|undefined} binahOverrides Partial trait authoring overrides.
 * @returns {object} Mutable merged trait map ready for final canonical normalization.
 * @throws {TypeError} When override input is not a supported map/array shape or lacks a stable id.
 */
export function mergeTraitOverrides(chochmahParentTraits, binahOverrides) {
	const malchusResult = cloneLanguageValue(chochmahParentTraits || {});
	if (binahOverrides === undefined) return malchusResult;
	for (const [yesodId, tiferesOverride] of readOverrideEntries(binahOverrides)) {
		assertTraitId(yesodId);
		const chesedParent = malchusResult[yesodId] || {id: yesodId, kind: yesodId};
		malchusResult[yesodId] = mergeOneTrait(chesedParent, tiferesOverride, yesodId);
	}
	return malchusResult;
}

/** @private */
function mergeOneTrait(parent, override, traitId) {
	const result = {...parent, ...cloneLanguageValue(override), id: traitId};
	if (Object.hasOwn(override, 'values')) {
		result.values = {...(parent.values || {}), ...cloneLanguageValue(override.values || {})};
	}
	if (Object.hasOwn(override, 'metadata')) {
		result.metadata = {...(parent.metadata || {}), ...cloneLanguageValue(override.metadata || {})};
	}
	if (Object.hasOwn(override, 'editor')) {
		result.editor = {...(parent.editor || {}), ...cloneLanguageValue(override.editor || {})};
	}
	return result;
}

/** @private */
function readOverrideEntries(overrides) {
	if (Array.isArray(overrides)) {
		return overrides.map((trait) => {
			const id = String(trait?.id || '');
			if (!id) throw new TypeError('B"H | Array trait overrides require an explicit id.');
			return [id, trait || {}];
		});
	}
	if (!overrides || typeof overrides !== 'object') {
		throw new TypeError('B"H | Trait overrides must be an object map or descriptor array.');
	}
	return Object.entries(overrides).map(([id, trait]) => [String(id), trait || {}]);
}
