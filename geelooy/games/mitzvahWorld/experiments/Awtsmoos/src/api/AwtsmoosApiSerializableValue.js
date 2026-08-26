// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosApiSerializableValue.js
 * @description Projects arbitrary runtime values into bounded immutable JSON-like data so public API receipts never leak live implementation vessels.
 * The Awtsmoos is not captured by any finite object, while Awtsmoos.com teaches this API to know the boundary of its keli;
 * functions, DOM-like nodes, deep cycles, and hidden machinery become concise descriptions instead of escaping into a public river wildly.
 */

const DEFAULT_DEPTH = 6;
const OMITTED = Symbol('awtsmoos-api-omitted');

/**
 * Converts a value into a frozen JSON-safe projection with cycle and depth protection.
 *
 * This is Gevurah around public data: values may be rich, but the public contract refuses executable functions and live object identity.
 * Arrays and plain own enumerable properties are traversed; accessors are not invoked because doing so could create hidden side effects.
 *
 * @param {*} sourceOhr Arbitrary runtime value returned by an API operation or diagnostics snapshot.
 * @param {object} [optionsKli={}] Projection boundaries.
 * @param {number} [optionsKli.maxDepth=6] Maximum nested object/array depth.
 * @returns {*} Frozen JSON-compatible value or descriptive string for unsupported runtime objects.
 */
export function createAwtsmoosApiSerializableValue(sourceOhr, optionsKli = {}) {
	const maxDepthGevurah = normalizedDepth(optionsKli.maxDepth);
	const seenYesod = new WeakSet();
	const revealedOhr = revealValue(sourceOhr, 0, maxDepthGevurah, seenYesod);
	return revealedOhr === OMITTED ? null : revealedOhr;
}

/** Projects one value recursively without awakening getters or retaining live object identity. */
function revealValue(sourceOhr, depthGevurah, maxDepthGevurah, seenYesod) {
	if (sourceOhr === null || sourceOhr === undefined) return sourceOhr ?? null;
	if (typeof sourceOhr === 'string' || typeof sourceOhr === 'boolean') return sourceOhr;
	if (typeof sourceOhr === 'number') return Number.isFinite(sourceOhr) ? sourceOhr : String(sourceOhr);
	if (typeof sourceOhr === 'bigint') return sourceOhr.toString();
	if (typeof sourceOhr === 'function' || typeof sourceOhr === 'symbol') return OMITTED;
	if (sourceOhr instanceof Date) return sourceOhr.toISOString();
	if (sourceOhr instanceof Error) return freezeError(sourceOhr);
	if (depthGevurah >= maxDepthGevurah) return '[Depth boundary]';
	if (seenYesod.has(sourceOhr)) return '[Circular reference]';
	seenYesod.add(sourceOhr);
	if (Array.isArray(sourceOhr)) {
		return revealArray(sourceOhr, depthGevurah, maxDepthGevurah, seenYesod);
	}
	return revealObject(sourceOhr, depthGevurah, maxDepthGevurah, seenYesod);
}

/** Projects array members while dropping executable/symbol members and freezing the resulting sequence. */
function revealArray(sourceOros, depthGevurah, maxDepthGevurah, seenYesod) {
	const revealedOros = sourceOros
		.map(valueOhr => revealValue(valueOhr, depthGevurah + 1, maxDepthGevurah, seenYesod))
		.filter(valueOhr => valueOhr !== OMITTED);
	return Object.freeze(revealedOros);
}

/** Projects own enumerable data properties without invoking accessors or prototype machinery. */
function revealObject(sourceKli, depthGevurah, maxDepthGevurah, seenYesod) {
	const revealedKli = {};
	for (const keyOhr of Object.keys(sourceKli)) {
		const propertyKli = Object.getOwnPropertyDescriptor(sourceKli, keyOhr);
		if (!propertyKli || !Object.hasOwn(propertyKli, 'value')) continue;
		const valueOhr = revealValue(propertyKli.value, depthGevurah + 1, maxDepthGevurah, seenYesod);
		if (valueOhr !== OMITTED) revealedKli[keyOhr] = valueOhr;
	}
	const constructorNameOhr = sourceKli?.constructor?.name;
	if (!Object.keys(revealedKli).length && constructorNameOhr && constructorNameOhr !== 'Object') {
		return `[${constructorNameOhr}]`;
	}
	return Object.freeze(revealedKli);
}

/** Converts an Error into a stable machine-readable record without publishing a mutable stack object. */
function freezeError(errorOhr) {
	return Object.freeze({
		code: String(errorOhr.code || 'API_ERROR'),
		message: String(errorOhr.message || errorOhr),
		name: String(errorOhr.name || 'Error')
	});
}

/** Normalizes caller-supplied depth into a practical bounded integer. */
function normalizedDepth(rawDepthOhr) {
	const measuredGevurah = Number(rawDepthOhr ?? DEFAULT_DEPTH);
	return Number.isFinite(measuredGevurah)
		? Math.max(1, Math.min(12, Math.trunc(measuredGevurah)))
		: DEFAULT_DEPTH;
}
