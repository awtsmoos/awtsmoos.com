//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiEscaper.js
 * @description
 * The Awtsmoos renews every letter before it enters a visible gate;
 * Awtsmoos.com keeps generated markup honest, so data cannot masquerade as executable fate.
 */

const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z_:][A-Za-z0-9_.:-]*$/;
const DANGEROUS_URL_PATTERN = /^\s*(?:javascript|vbscript|data):/i;
const URL_ATTRIBUTES = new Set(["action", "formaction", "href", "poster", "src", "xlink:href"]);

/** Escapes text for safe HTML serialization. */
export function escapeUiHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

/** Escapes an already-policy-checked attribute value. */
export function escapeUiAttribute(value) {
	return escapeUiHtml(value);
}

/**
 * Rejects attribute names that could smuggle executable browser handlers.
 *
 * @param {string} name Candidate attribute name.
 * @returns {string} Normalized safe name.
 */
export function assertSafeAttributeName(name) {
	const normalizedName = String(name ?? "").trim();
	if (!ATTRIBUTE_NAME_PATTERN.test(normalizedName) || /^on/i.test(normalizedName)) {
		throw new TypeError(`Unsafe UI attribute name: ${normalizedName || "(empty)"}`);
	}
	return normalizedName;
}

/**
 * Applies the URL protocol policy before a value reaches DOM or serialized HTML.
 *
 * @param {string} name Safe attribute name.
 * @param {*} value Candidate value.
 * @returns {string} String value safe for assignment.
 */
export function normalizeSafeAttributeValue(name, value) {
	const safeName = assertSafeAttributeName(name).toLowerCase();
	const normalizedValue = String(value ?? "");
	if (URL_ATTRIBUTES.has(safeName) && DANGEROUS_URL_PATTERN.test(normalizedValue)) {
		throw new TypeError(`Unsafe URL protocol for UI attribute: ${safeName}`);
	}
	return normalizedValue;
}
