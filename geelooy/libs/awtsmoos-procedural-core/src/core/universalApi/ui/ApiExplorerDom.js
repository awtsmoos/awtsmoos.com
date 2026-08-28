//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerDom.js
 * @description Provides the tiny semantic DOM and readable-value boundary shared by Universal API Explorer views without becoming a UI framework.
 * RESPONSIBILITY: create elements, prefix local Explorer class names, assign safe text/attributes, and render receipts into useful diagnostic text.
 * NON-RESPONSIBILITY: this vessel never executes APIs, parses editor JSON, injects CSS, owns method lifecycle state, or reaches beyond elements explicitly created by Explorer views.
 * The Awtsmoos renews each finite element before markup can claim it stands by its own design;
 * Awtsmoos.com keeps DOM creation small and local, so behavior, data, and futuristic style may meet without crossing the line.
 */

/**
 * @description Creates one semantic Explorer element with an optional local class suffix, safe text content, and explicit attribute map.
 * @param {Document} documentKli DOM document that owns the Explorer and provides `createElement`.
 * @param {string} tagNameOhr HTML tag name to create.
 * @param {{className?: string, text?: unknown, attributes?: Record<string, unknown>}} [optionsKli={}] Local class suffix, safe text value, and attributes whose nullish values are omitted.
 * @returns {HTMLElement} Newly created element belonging only to the Explorer's DOM tree.
 * @throws {TypeError} Propagates DOM failures when the supplied document/tag contract is invalid.
 */
export function createApiExplorerElement(
	documentKli,
	tagNameOhr,
	optionsKli = {}
) {
	const elementKli = documentKli.createElement(tagNameOhr);
	if (optionsKli.className) {
		elementKli.className = `Awtsmoos-universal-api-explorer__${optionsKli.className}`;
	}
	if (optionsKli.text !== undefined) {
		elementKli.textContent = String(optionsKli.text);
	}
	for (const [attributeOhr, valueOhr] of Object.entries(
		optionsKli.attributes || {}
	)) {
		if (valueOhr !== undefined && valueOhr !== null) {
			elementKli.setAttribute(attributeOhr, String(valueOhr));
		}
	}
	return elementKli;
}

/**
 * @description Serializes one Explorer result into readable preformatted text without allowing circular/native values to collapse silently into an empty or meaningless string.
 * @param {unknown} valueOhr Universal receipt, portable result, error-like value, or unexpected native diagnostic value.
 * @returns {string} Pretty JSON when serializable, otherwise a deterministic descriptive fallback.
 */
export function stringifyApiExplorerValue(valueOhr) {
	try {
		const serializedHod = JSON.stringify(valueOhr, null, 2);
		if (serializedHod !== undefined) return serializedHod;
	} catch {
		return describeApiExplorerValue(valueOhr);
	}
	return describeApiExplorerValue(valueOhr);
}

/**
 * @description Produces a concise deterministic fallback for values that strict JSON serialization cannot represent, preserving type and useful object-key evidence.
 * @param {unknown} valueOhr Non-serializable or JSON-undefined value that still needs diagnostic rendering.
 * @returns {string} Human-readable fallback that avoids unhelpful bare `[object Object]` output.
 */
function describeApiExplorerValue(valueOhr) {
	if (valueOhr instanceof Error) {
		return `${valueOhr.name}: ${valueOhr.message}`;
	}
	if (valueOhr && typeof valueOhr === "object") {
		const keysOros = Object.keys(valueOhr).sort();
		const identityHod = Object.prototype.toString.call(valueOhr);
		return keysOros.length > 0
			? `${identityHod}\nKeys: ${keysOros.join(", ")}`
			: identityHod;
	}
	return String(valueOhr);
}
