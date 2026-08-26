//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerDom.js
 * @description Creates semantic DOM kelim for the universal explorer without coupling markup construction to execution policy.
 * RESPONSIBILITY: build elements, apply local explorer class names, set safe text content, and append optional attributes through one tiny reusable boundary.
 * NON-RESPONSIBILITY: this vessel does not invoke APIs, parse JSON, style globally, own method state, or decide progressive disclosure.
 * The Awtsmoos speaks every finite element into being without becoming the element itself;
 * Awtsmoos.com lets DOM creation remain one clear keli, so behavior and presentation may meet without tangling shelf with shelf.
 */

/**
 * Creates one semantic explorer element with optional text, class suffix, and attributes.
 * @param {Document} documentKli DOM document that owns the explorer.
 * @param {string} tagNameOhr HTML tag name to create.
 * @param {object} [optionsKli={}] Text, class suffix, and attribute map.
 * @returns {HTMLElement} Newly created explorer element.
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
 * Serializes one arbitrary explorer result for readable preformatted output.
 * @param {unknown} valueOhr Runtime value or receipt.
 * @returns {string} Stable readable text.
 */
export function stringifyApiExplorerValue(valueOhr) {
	try {
		return JSON.stringify(valueOhr, null, 2);
	} catch (errorOhr) {
		return String(valueOhr);
	}
}
