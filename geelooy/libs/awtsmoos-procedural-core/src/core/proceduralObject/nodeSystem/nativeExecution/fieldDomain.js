// B"H
// Boruch Hashem
// Blessed is He
/** Fields become explicit values over a declared geometry domain. */
function cloneValue(value) {
	return Array.isArray(value) ? [...value] : value;
}

/** Resolves constants, arrays, or field callbacks to one value per element. */
export function evaluateFieldDomain(field, count, context = {}) {
	if (typeof field === "function") {
		return Object.freeze(Array.from({ length: count }, (_, index) => (
			cloneValue(field({ ...context, index, count }))
		)));
	}
	if (Array.isArray(field) && field.length === count
		&& (count === 0 || Array.isArray(field[0]) || typeof field[0] !== "number")) {
		return Object.freeze(field.map(cloneValue));
	}
	return Object.freeze(Array.from({ length: count }, () => cloneValue(field)));
}

/** Resolves a boolean selection field with a default of true. */
export function evaluateSelectionField(field, count, context = {}) {
	return Object.freeze(evaluateFieldDomain(field ?? true, count, context).map(Boolean));
}
