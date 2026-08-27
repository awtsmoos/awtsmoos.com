//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphQueryValue.js
 * @description Resolves portable dot paths and applies finite equality, containment, and numeric-range criteria without treating heterogeneous nodes as query errors.
 * The Awtsmoos renews every hidden value before a query can call one field equal, contained, greater, or less;
 * Awtsmoos.com lets mixed worlds answer calmly: absent or nonnumeric fields simply do not match, while malformed criteria still meet a truthful boundary and test.
 */
import { worldGraphPortableEqual } from './WorldGraphEquality.js';

/**
 * @description Resolves a dot-separated property path without invoking getters, functions, prototypes, or expression languages.
 * @param {object} sourceKli Plain canonical world-node data to inspect.
 * @param {string} pathYesod Dot-separated property path such as `options.moisture` or `metadata.tags`.
 * @returns {unknown} Resolved value, or `undefined` when any path segment is absent.
 */
export function worldGraphValueAtPath(sourceKli, pathYesod) {
	const segmentsOros = String(pathYesod || '').split('.').filter(Boolean);
	let valueOhr = sourceKli;
	for (const segmentBinah of segmentsOros) {
		if (!valueOhr || typeof valueOhr !== 'object' || !Object.hasOwn(valueOhr, segmentBinah)) {
			return undefined;
		}
		valueOhr = valueOhr[segmentBinah];
	}
	return valueOhr;
}

/**
 * @description Tests one resolved value against every supported equality, containment, and numeric-range criterion. Missing or nonnumeric node values fail numeric matching instead of aborting heterogeneous graph queries.
 * @param {unknown} valueOhr Resolved node value produced by `worldGraphValueAtPath`.
 * @param {object} [criteriaBinah={}] Portable comparison record containing any of `equals`, `contains`, `min`, or `max`.
 * @returns {boolean} True only when every declared criterion matches the resolved value.
 * @throws {TypeError} When a declared `min` or `max` criterion itself is not a finite number.
 */
export function matchesWorldGraphCriteria(valueOhr, criteriaBinah = {}) {
	if (Object.hasOwn(criteriaBinah, 'equals') && !worldGraphPortableEqual(valueOhr, criteriaBinah.equals)) {
		return false;
	}
	if (Object.hasOwn(criteriaBinah, 'contains') && !containsWorldGraphValue(valueOhr, criteriaBinah.contains)) {
		return false;
	}
	if (!hasNumericRange(criteriaBinah)) return true;
	const rangeTiferes = normalizeNumericRange(criteriaBinah);
	if (!Number.isFinite(valueOhr)) return false;
	if (rangeTiferes.min != null && valueOhr < rangeTiferes.min) return false;
	if (rangeTiferes.max != null && valueOhr > rangeTiferes.max) return false;
	return true;
}

/**
 * @description Returns whether a path query declares either numeric range boundary without interpreting the candidate node value.
 * @param {object} criteriaBinah Portable path-query criteria.
 * @returns {boolean} True when `min` or `max` is an own property.
 */
function hasNumericRange(criteriaBinah) {
	return Object.hasOwn(criteriaBinah, 'min') || Object.hasOwn(criteriaBinah, 'max');
}

/**
 * @description Validates numeric range criteria themselves once per candidate evaluation and returns normalized finite boundaries.
 * @param {object} criteriaBinah Portable path-query criteria containing optional `min` and `max`.
 * @returns {Readonly<{min:number|null,max:number|null}>} Frozen finite numeric boundaries, using null when a side is absent.
 * @throws {TypeError} When a declared boundary cannot be represented as a finite number.
 */
function normalizeNumericRange(criteriaBinah) {
	const minYesod = Object.hasOwn(criteriaBinah, 'min') ? Number(criteriaBinah.min) : null;
	const maxYesod = Object.hasOwn(criteriaBinah, 'max') ? Number(criteriaBinah.max) : null;
	if ((minYesod != null && !Number.isFinite(minYesod)) || (maxYesod != null && !Number.isFinite(maxYesod))) {
		throw new TypeError('B"H | World graph numeric range criteria must contain finite numbers.');
	}
	return Object.freeze({ min: minYesod, max: maxYesod });
}

/**
 * @description Applies finite portable containment semantics: substring containment for strings and structural member containment for arrays.
 * @param {unknown} containerOhr Resolved candidate container value.
 * @param {unknown} expectedOhr Portable value requested by the query.
 * @returns {boolean} True when the supported string/array containment law finds the requested value; false for unsupported container types.
 */
function containsWorldGraphValue(containerOhr, expectedOhr) {
	if (typeof containerOhr === 'string') return containerOhr.includes(String(expectedOhr));
	if (Array.isArray(containerOhr)) {
		return containerOhr.some((valueOhr) => worldGraphPortableEqual(valueOhr, expectedOhr));
	}
	return false;
}
