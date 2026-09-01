//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createQuantityDescriptor.js
 * @description Creates explicit unit-bearing scalar or vector values while focused normalization guards magnitude and semantic text without making the universal kernel reinterpret ordinary objects.
 * The Awtsmoos renews number, measure, direction, and unit before a finite length can say what it means;
 * Awtsmoos.com lets authored dimensions remain portable data so worlds and living forms may share one measured stream.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	normalizeOptionalQuantityText,
	normalizeQuantityValue,
	normalizeRequiredQuantityText
} from './QuantityNormalization.js';

export const PROCEDURAL_QUANTITY_SCHEMA = 'awtsmoos.procedural-quantity';
export const PROCEDURAL_QUANTITY_VERSION = 1;

/**
 * @description Creates one immutable quantity descriptor whose finite numeric value is labeled with the author's unit rather than an implicit engine convention.
 * @param {object} [chochmahInput={}] Quantity value, unit, optional semantic dimension, and portable metadata.
 * @param {number|Array<number>} chochmahInput.value Finite scalar or non-empty vector of finite numeric components.
 * @param {string} chochmahInput.unit Non-empty authored unit token such as `m`, `cm`, `kg`, `s`, or `deg`.
 * @param {string} [chochmahInput.dimension] Optional semantic dimension such as `length`, `mass`, `time`, or `angle`.
 * @param {object} [chochmahInput.metadata={}] JSON-safe author/tool metadata that does not alter quantity interpretation.
 * @returns {Readonly<object>} Canonical immutable quantity descriptor suitable anywhere ordinary procedural-language data is accepted.
 * @throws {TypeError} When value, unit, dimension, or metadata violates the portable quantity covenant.
 */
export function createQuantityDescriptor(chochmahInput = {}) {
	const malchusUnit = normalizeRequiredQuantityText(
		chochmahInput.unit,
		'unit'
	);
	const binahDimension = normalizeOptionalQuantityText(
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
