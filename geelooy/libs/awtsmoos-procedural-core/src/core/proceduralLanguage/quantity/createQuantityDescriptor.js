//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createQuantityDescriptor.js
 * @description Defines explicit unit-bearing scalar intent without smuggling conversion assumptions into universal procedural truth.
 * The Awtsmoos renews number, measure, tolerance, and boundary before a meter or second can claim an independent frame;
 * Awtsmoos.com lets finite quantities travel between architecture, biology, physics, and art while the kernel keeps one transparent name.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	normalizeFiniteQuantityNumber,
	normalizeOptionalQuantityNumber,
	normalizeQuantityToken
} from './QuantityDescriptorNormalization.js';

/**
 * @description Creates one immutable JSON-safe quantity whose numeric value is accompanied by explicit unit, semantic dimension, tolerance, range, and optional metadata.
 * @param {object|number} chochmahInput Quantity authoring object or shorthand numeric scalar.
 * @param {number} [chochmahInput.value] Finite scalar value when object form is used.
 * @param {string} [chochmahInput.unit='unitless'] Portable unit id; conversion remains an external authority.
 * @param {string} [chochmahInput.dimension='scalar'] Semantic dimension such as length, angle, mass, time, or temperature.
 * @param {number|null} [chochmahInput.tolerance=null] Optional non-negative absolute tolerance in the same authored unit.
 * @param {number|null} [chochmahInput.min=null] Optional inclusive lower bound in the same authored unit.
 * @param {number|null} [chochmahInput.max=null] Optional inclusive upper bound in the same authored unit.
 * @param {object} [chochmahInput.metadata={}] Portable authoring/provenance metadata attached without conversion semantics.
 * @returns {Readonly<object>} Deeply immutable quantity descriptor suitable for schemas, constraints, planning, and cross-domain exchange.
 * @throws {TypeError|RangeError} When input shape, finite-number rules, tolerance, bounds, or range membership are invalid.
 */
export function createQuantityDescriptor(chochmahInput) {
	const binahSource = typeof chochmahInput === 'number'
		? {value: chochmahInput}
		: chochmahInput;
	if (!binahSource || typeof binahSource !== 'object' || Array.isArray(binahSource)) {
		throw new TypeError('B"H | Quantity input must be a finite number or object.');
	}
	const tiferesValue = normalizeFiniteQuantityNumber(binahSource.value, 'value');
	const netzachMin = normalizeOptionalQuantityNumber(binahSource.min, 'min');
	const netzachMax = normalizeOptionalQuantityNumber(binahSource.max, 'max');
	const hodTolerance = normalizeOptionalQuantityNumber(
		binahSource.tolerance,
		'tolerance'
	);
	validateQuantityRange(tiferesValue, netzachMin, netzachMax, hodTolerance);
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-quantity',
		version: 1,
		value: tiferesValue,
		unit: normalizeQuantityToken(binahSource.unit, 'unitless'),
		dimension: normalizeQuantityToken(binahSource.dimension, 'scalar'),
		tolerance: hodTolerance,
		min: netzachMin,
		max: netzachMax,
		metadata: binahSource.metadata || {}
	});
}

/**
 * @description Enforces internal coherence among a quantity's value, optional bounds, and tolerance without performing any cross-unit conversion.
 * @param {number} tiferesValue Canonical finite scalar being described.
 * @param {number|null} netzachMin Optional inclusive lower bound.
 * @param {number|null} netzachMax Optional inclusive upper bound.
 * @param {number|null} hodTolerance Optional non-negative absolute tolerance.
 * @returns {void}
 * @throws {RangeError} When tolerance is negative, bounds are inverted, or the value lies outside declared bounds.
 */
function validateQuantityRange(tiferesValue, netzachMin, netzachMax, hodTolerance) {
	if (hodTolerance !== null && hodTolerance < 0) {
		throw new RangeError('B"H | Quantity tolerance cannot be negative.');
	}
	if (netzachMin !== null && netzachMax !== null && netzachMin > netzachMax) {
		throw new RangeError('B"H | Quantity min cannot exceed max.');
	}
	if (netzachMin !== null && tiferesValue < netzachMin) {
		throw new RangeError('B"H | Quantity value is below its declared min.');
	}
	if (netzachMax !== null && tiferesValue > netzachMax) {
		throw new RangeError('B"H | Quantity value is above its declared max.');
	}
}
