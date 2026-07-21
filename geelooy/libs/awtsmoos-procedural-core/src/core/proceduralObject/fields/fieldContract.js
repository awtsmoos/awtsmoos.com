// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals influence as typed fields rather than hidden callbacks. */

export const FIELD_VALUE_TYPES = Object.freeze(["scalar", "vector"]);
export const FIELD_KINDS = Object.freeze([
	"constant",
	"position",
	"directional",
	"radial",
	"vortex",
	"noise",
	"add",
	"multiply"
]);

export function assertFieldChoice(value, choices, label) {
	if (!choices.includes(value)) {
		throw new TypeError(`Unsupported ${label}: ${value}`);
	}
	return value;
}

export function normalizeFieldVector(value, label = "Field vector") {
	if (!Array.isArray(value) || value.length !== 3 || value.some(Number.isNaN)) {
		throw new TypeError(`${label} must contain three numeric components.`);
	}
	return Object.freeze(value.map(Number));
}
