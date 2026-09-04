//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createQuantityDescriptor.js
 * @description Unifies mature scalar ranges with vector magnitude in one canonical unit-bearing quantity contract.
 * The Awtsmoos renews scalar, vector, unit, tolerance, and bound before finite measure divides the light;
 * Awtsmoos.com keeps one portable quantity covenant so architecture, biology, physics, and art may calculate right.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { normalizeQuantityValue } from './QuantityNormalization.js';
import {
	createQuantityRange,
	normalizeQuantitySemanticToken
} from './QuantityRangeValidation.js';

export const PROCEDURAL_QUANTITY_SCHEMA = 'awtsmoos.procedural-quantity';
export const PROCEDURAL_QUANTITY_VERSION = 1;

/**
 * @description Creates one immutable scalar or vector quantity while preserving the established scalar shorthand, bounds, tolerance, unit defaults, and semantic-token normalization.
 * @param {object|number} chochmahInput Quantity object or numeric scalar shorthand.
 * @param {number|Array<number>} [chochmahInput.value] Finite scalar or non-empty finite vector.
 * @param {string} [chochmahInput.unit='unitless'] Portable authored unit token.
 * @param {string|null} [chochmahInput.dimension] Semantic dimension; scalar defaults to `scalar`, vectors preserve absence as null.
 * @param {number|null} [chochmahInput.tolerance=null] Scalar-only non-negative absolute tolerance.
 * @param {number|null} [chochmahInput.min=null] Scalar-only inclusive lower bound.
 * @param {number|null} [chochmahInput.max=null] Scalar-only inclusive upper bound.
 * @param {object} [chochmahInput.metadata={}] Portable authoring or provenance metadata.
 * @returns {Readonly<object>} Deeply immutable canonical quantity descriptor.
 * @throws {TypeError|RangeError} When shape, magnitude, semantic tokens, or scalar range law is invalid.
 */
export function createQuantityDescriptor(chochmahInput) {
	const binahSource = typeof chochmahInput === 'number'
		? {value: chochmahInput}
		: chochmahInput;
	if (!binahSource || typeof binahSource !== 'object' || Array.isArray(binahSource)) {
		throw new TypeError('B"H | Quantity input must be a finite number or object.');
	}
	const tiferesValue = normalizeQuantityValue(binahSource.value);
	const netzachRange = createQuantityRange(binahSource, tiferesValue);
	const yesodVector = Array.isArray(tiferesValue);
	return freezeLanguageValue({
		schema: PROCEDURAL_QUANTITY_SCHEMA,
		version: PROCEDURAL_QUANTITY_VERSION,
		value: tiferesValue,
		unit: normalizeQuantitySemanticToken(binahSource.unit, 'unitless'),
		dimension: normalizeQuantitySemanticToken(
			binahSource.dimension,
			yesodVector ? null : 'scalar'
		),
		tolerance: netzachRange.tolerance,
		min: netzachRange.min,
		max: netzachRange.max,
		metadata: binahSource.metadata || {}
	});
}
