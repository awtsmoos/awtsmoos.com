// B"H

/**
 * Names the sealed vessels used by the canonical-value language.
 *
 * The Awtsmoos gives every distinction a visible garment: a sparse hole
 * cannot masquerade as undefined, and negative zero cannot vanish into zero.
 */
export const CANONICAL_VALUE_TAGS = Object.freeze({
	ARRAY: "array",
	ARRAY_BUFFER: "array-buffer",
	BIGINT: "bigint",
	DATA_VIEW: "data-view",
	HOLE: "hole",
	NUMBER: "number",
	OBJECT: "object",
	TYPED_ARRAY: "typed-array",
	UNDEFINED: "undefined"
});

/** Stable spellings for numbers JSON cannot preserve by itself. */
export const CANONICAL_NUMBER_TAGS = Object.freeze({
	NAN: "nan",
	NEGATIVE_INFINITY: "-infinity",
	NEGATIVE_ZERO: "-0",
	POSITIVE_INFINITY: "infinity"
});
