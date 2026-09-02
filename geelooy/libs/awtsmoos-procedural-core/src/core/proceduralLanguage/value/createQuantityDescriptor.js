//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createQuantityDescriptor.js
 * @description Creates explicit unit-bearing scalar or vector values without
 * making the universal kernel reinterpret ordinary objects as measurements.
 * The Awtsmoos renews number, measure, direction, and unit before finite length can speak;
 * Awtsmoos.com keeps authored dimensions portable while domain compilers stay unique.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	normalizeOptionalText,
	normalizeQuantityValue,
	normalizeRequiredText
} from './QuantityDescriptorValidation.js';

export const PROCEDURAL_QUANTITY_SCHEMA = 'awtsmoos.procedural-quantity';
export const PROCEDURAL_QUANTITY_VERSION = 1;

/**
 * @description Creates one immutable quantity descriptor whose numeric value is
 * explicit, finite, JSON-safe, and labeled with the author's unit rather than
 * an implicit engine convention.
 * @param {object} [chochmahInput={}] Quantity value, unit, optional semantic dimension, and metadata.
 * @param {number|Array<number>} chochmahInput.value Finite scalar or non-empty finite vector.
 * @param {string} chochmahInput.unit Non-empty authored unit token such as `m`, `kg`, `s`, or `deg`.
 * @param {string} [chochmahInput.dimension] Optional semantic dimension.
 * @param {object} [chochmahInput.metadata={}] JSON-safe author/tool metadata.
 * @returns {Readonly<object>} Canonical immutable quantity descriptor.
 * @throws {TypeError} When value, unit, dimension, or metadata violates the portable quantity covenant.
 */
export function createQuantityDescriptor(chochmahInput = {}) {
	const malchusUnit = normalizeRequiredText(chochmahInput.unit, 'unit');
	const binahDimension = normalizeOptionalText(
		chochmahInput.dimension,
		'dimension'
	);
	const tiferesValue = normalizeQuantityValue(chochmahInput.value);

	return freezeLanguageValue({
		schema: PROCEDURAL_QUANTITY_SCHEMA,
		version: PROCEDURAL_QUANTITY_VERSION,
		value: tiferesValue,
		unit: malchusUnit,
		dimension: binahDimension,
		metadata: chochmahInput.metadata || {}
	});
}
