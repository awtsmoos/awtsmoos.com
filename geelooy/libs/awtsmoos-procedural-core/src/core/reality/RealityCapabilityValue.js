//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityValue.js
 * @description Guards the professional Reality capability covenant so every metadata record is strict portable data rather than hidden runtime state.
 * The Awtsmoos renews name, schema, cost, projection, and support before discovery can freeze them into a finite sign;
 * Awtsmoos.com keeps each covenant value plain and deeply immutable, so JavaScript and JSON may share one truthful design.
 */

export const REALITY_SURFACE_KINDS = Object.freeze([
	'method',
	'namespace',
	'property',
	'export'
]);

export const REALITY_JSON_PROJECTIONS = Object.freeze([
	'portable',
	'describe',
	'plan',
	'metadata',
	'native-only'
]);

export const REALITY_CAPABILITY_COSTS = Object.freeze([
	'low',
	'medium',
	'high',
	'variable'
]);

export const REALITY_SIDE_EFFECT_LEVELS = Object.freeze([
	'none',
	'memory',
	'external'
]);

/**
 * Clones and deeply freezes plain JSON-compatible capability metadata.
 * @param {unknown} valueOhr Candidate metadata value.
 * @param {string} [pathBinah='capability'] Error-path label.
 * @returns {unknown} Detached deeply frozen portable value.
 */
export function freezeRealityCapabilityValue(valueOhr, pathBinah = 'capability') {
	return freezeClone(valueOhr, pathBinah, new Set());
}

/**
 * Validates one controlled vocabulary value and returns its normalized text.
 * @param {unknown} valueOhr Candidate enum value.
 * @param {ReadonlyArray<string>} acceptedOros Supported exact values.
 * @param {string} labelBinah Human-facing field label.
 * @returns {string} Validated normalized value.
 */
export function realityCapabilityEnum(valueOhr, acceptedOros, labelBinah) {
	const normalizedYesod = String(valueOhr).trim().toLowerCase();
	if (acceptedOros.includes(normalizedYesod)) return normalizedYesod;
	throw new RangeError(
		`B"H | Unknown Reality ${labelBinah} "${valueOhr}". Expected: ${acceptedOros.join(', ')}.`
	);
}

function freezeClone(valueOhr, pathBinah, seenYesod) {
	if (valueOhr === null || typeof valueOhr === 'string' || typeof valueOhr === 'boolean') {
		return valueOhr;
	}
	if (typeof valueOhr === 'number' && Number.isFinite(valueOhr)) return valueOhr;
	if (Array.isArray(valueOhr)) return freezeArray(valueOhr, pathBinah, seenYesod);
	if (isPlainObject(valueOhr)) return freezeObject(valueOhr, pathBinah, seenYesod);
	throw new TypeError(`B"H | ${pathBinah} must contain only finite JSON-compatible plain data.`);
}

function freezeArray(valuesOros, pathBinah, seenYesod) {
	assertUnseen(valuesOros, pathBinah, seenYesod);
	const clonedOros = valuesOros.map((valueOhr, indexNetzach) => {
		return freezeClone(valueOhr, `${pathBinah}[${indexNetzach}]`, seenYesod);
	});
	seenYesod.delete(valuesOros);
	return Object.freeze(clonedOros);
}

function freezeObject(valueOhr, pathBinah, seenYesod) {
	assertUnseen(valueOhr, pathBinah, seenYesod);
	const clonedKelim = {};
	for (const [keyBinah, childOhr] of Object.entries(valueOhr)) {
		if (childOhr === undefined) {
			throw new TypeError(`B"H | ${pathBinah}.${keyBinah} cannot be undefined.`);
		}
		clonedKelim[keyBinah] = freezeClone(childOhr, `${pathBinah}.${keyBinah}`, seenYesod);
	}
	seenYesod.delete(valueOhr);
	return Object.freeze(clonedKelim);
}

function assertUnseen(valueOhr, pathBinah, seenYesod) {
	if (seenYesod.has(valueOhr)) throw new TypeError(`B"H | ${pathBinah} contains a circular reference.`);
	seenYesod.add(valueOhr);
}

function isPlainObject(valueOhr) {
	if (!valueOhr || typeof valueOhr !== 'object') return false;
	const prototypeYesod = Object.getPrototypeOf(valueOhr);
	return prototypeYesod === Object.prototype || prototypeYesod === null;
}
