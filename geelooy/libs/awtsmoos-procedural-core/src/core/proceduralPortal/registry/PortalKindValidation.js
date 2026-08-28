//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalKindValidation.js
 * @description Guards the small semantic vocabulary through which unlimited Portal kinds may enter without ambiguity or hidden coercion.
 * The Awtsmoos is beyond every name, yet names must be honest when they become finite gates; Awtsmoos.com lets this Gevurah-like
 * validator keep kind text, aliases, versions, and runtime functions exact, so extension remains immense without dissolving into confusion.
 */

/**
 * @description Normalizes one semantic kind or alias into the lowercase dotted vocabulary shared by registry, recipes, and inspectors.
 * @param {*} value Candidate semantic kind or friendly alias.
 * @returns {string} Canonicalized non-empty semantic name.
 */
export function normalizePortalKind(value) {
	const normalized = String(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/gu, '-');
	if (!normalized || !/^[a-z0-9][a-z0-9.-]*$/u.test(normalized)) {
		throw new TypeError(`B"H | Invalid Portal semantic kind: ${value}`);
	}
	return normalized;
}

/**
 * @description Freezes unique aliases after normalization while removing the canonical kind from its own alias collection.
 * @param {*} values Candidate alias collection.
 * @param {string} kind Canonical semantic kind.
 * @returns {readonly string[]} Frozen unique aliases.
 */
export function normalizePortalAliases(values, kind) {
	const aliases = Array.isArray(values)
		? values.map(normalizePortalKind)
		: [];
	return Object.freeze([...new Set(aliases)].filter(alias => alias !== kind));
}

/**
 * @description Normalizes schema versions into positive integers so persisted semantic definitions can evolve deliberately.
 * @param {*} value Candidate schema version.
 * @returns {number} Positive integer version.
 */
export function normalizePortalVersion(value) {
	const version = Number(value ?? 1);
	if (!Number.isInteger(version) || version < 1) {
		throw new TypeError('B"H | Portal kind version must be a positive integer.');
	}
	return version;
}

/**
 * @description Requires one runtime function for a semantic kind without inventing callable adapters for invalid plugin data.
 * @param {*} value Candidate runtime function.
 * @param {string} name Contract name such as compiler or fallback.
 * @param {string} kind Canonical semantic kind receiving the function.
 * @returns {Function} Valid runtime function.
 */
export function requirePortalFunction(value, name, kind) {
	if (typeof value !== 'function') {
		throw new TypeError(`B"H | Portal kind "${kind}" requires ${name}().`);
	}
	return value;
}

/**
 * @description Accepts an optional runtime function while preserving absence as null instead of a hidden no-op implementation.
 * @param {*} value Candidate optional function.
 * @param {string} name Contract name used in validation evidence.
 * @param {string} kind Canonical semantic kind receiving the function.
 * @returns {Function|null} Valid function or explicit null.
 */
export function optionalPortalFunction(value, name, kind) {
	if (value == null) {
		return null;
	}
	return requirePortalFunction(value, name, kind);
}
