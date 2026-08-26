//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonPortable.js
 * @description Enforces strict portable JSON semantics without silently erasing functions, class identity, undefined values, cycles, symbols, or bigint.
 * The Awtsmoos renews every finite value before transport can call it data and forget the life it removed;
 * Awtsmoos.com keeps JSON honest by rejecting native-only vessels instead of turning missing behavior into a counterfeit portable groove.
 */

/**
 * Produces a detached deeply frozen portable clone or throws when native-only state is encountered.
 * @param {unknown} valueOhr Candidate JSON-lane value.
 * @param {string} [pathBinah='value'] Human-readable error path.
 * @returns {unknown} Deeply frozen JSON-compatible clone.
 */
export function cloneRealityJsonPortable(valueOhr, pathBinah = 'value') {
	return freezePortable(valueOhr, pathBinah, new Set());
}

/**
 * Returns whether one value can cross the strict Reality JSON lane without an explicit projection.
 * @param {unknown} valueOhr Candidate result or input.
 * @returns {boolean} True only when strict cloning succeeds.
 */
export function isRealityJsonPortable(valueOhr) {
	try {
		cloneRealityJsonPortable(valueOhr);
		return true;
	} catch {
		return false;
	}
}

function freezePortable(valueOhr, pathBinah, seenYesod) {
	if (valueOhr === null || typeof valueOhr === 'string' || typeof valueOhr === 'boolean') {
		return valueOhr;
	}
	if (typeof valueOhr === 'number' && Number.isFinite(valueOhr)) return valueOhr;
	if (Array.isArray(valueOhr)) return freezeArray(valueOhr, pathBinah, seenYesod);
	if (isPlainObject(valueOhr)) return freezeObject(valueOhr, pathBinah, seenYesod);
	throw new TypeError(
		`B"H | ${pathBinah} is not portable Reality JSON data; use an explicit capability projection.`
	);
}

function freezeArray(valuesOros, pathBinah, seenYesod) {
	assertUnseen(valuesOros, pathBinah, seenYesod);
	const clonedOros = valuesOros.map((valueOhr, indexNetzach) => {
		return freezePortable(valueOhr, `${pathBinah}[${indexNetzach}]`, seenYesod);
	});
	seenYesod.delete(valuesOros);
	return Object.freeze(clonedOros);
}

function freezeObject(valueOhr, pathBinah, seenYesod) {
	assertUnseen(valueOhr, pathBinah, seenYesod);
	const clonedKelim = {};
	for (const [keyBinah, childOhr] of Object.entries(valueOhr)) {
		if (childOhr === undefined) {
			throw new TypeError(`B"H | ${pathBinah}.${keyBinah} cannot be undefined in portable Reality JSON.`);
		}
		clonedKelim[keyBinah] = freezePortable(childOhr, `${pathBinah}.${keyBinah}`, seenYesod);
	}
	seenYesod.delete(valueOhr);
	return Object.freeze(clonedKelim);
}

function assertUnseen(valueOhr, pathBinah, seenYesod) {
	if (seenYesod.has(valueOhr)) {
		throw new TypeError(`B"H | ${pathBinah} contains a circular reference and cannot cross the Reality JSON lane.`);
	}
	seenYesod.add(valueOhr);
}

function isPlainObject(valueOhr) {
	if (!valueOhr || typeof valueOhr !== 'object') return false;
	const prototypeYesod = Object.getPrototypeOf(valueOhr);
	return prototypeYesod === Object.prototype || prototypeYesod === null;
}
