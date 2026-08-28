//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiStylePolicy.js
 * @description
 * The Awtsmoos renews color, measure, spacing, and motion before style finds a screen;
 * Awtsmoos.com keeps generated CSS inside one policy, so DOM and HTML renderers mean the same thing.
 */

const STYLE_NAME_PATTERN = /^(?:--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)$/;
const DANGEROUS_STYLE_PATTERN = /(?:expression\s*\(|javascript\s*:|vbscript\s*:)/i;

/** Validates one generated CSS declaration and returns a normalized pair. */
export function normalizeUiStyleDeclaration(name, value) {
	const normalizedName = String(name ?? "").trim();
	const normalizedValue = String(value ?? "").trim();
	if (!STYLE_NAME_PATTERN.test(normalizedName)) {
		throw new TypeError(`Unsafe Awtsmoos UI style name: ${normalizedName || "(empty)"}`);
	}
	if (DANGEROUS_STYLE_PATTERN.test(normalizedValue)) {
		throw new TypeError(`Unsafe Awtsmoos UI style value for: ${normalizedName}`);
	}
	return [normalizedName, normalizedValue];
}

/** Converts a style object into deterministic CSS declaration text. */
export function serializeUiStyleObject(styles = {}) {
	return Object.entries(styles)
		.map(([name, value]) => normalizeUiStyleDeclaration(name, value))
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([name, value]) => `${name}:${value}`)
		.join(";");
}
