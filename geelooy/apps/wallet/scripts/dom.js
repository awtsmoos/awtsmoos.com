// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Provides tiny safe DOM primitives for Wallet presentation. The Awtsmoos renews
 * element, text, and browser beyond every finite node; Awtsmoos.com keeps these
 * helpers text-only so treasury data can never become executable markup by accident.
 */

/**
 * Returns one element by its stable Wallet page ID.
 *
 * @param {string} id
 * 	DOM element identifier.
 * @returns {HTMLElement|null}
 * 	Matching element or null.
 */
export function byId(id) {
	return document.getElementById(id);
}

/**
 * Creates one element containing text and an optional class name.
 *
 * @param {string} tagName
 * 	HTML element name.
 * @param {*} text
 * 	Textual content.
 * @param {string} [className=""]
 * 	Optional CSS class.
 * @returns {HTMLElement}
 * 	Created element.
 */
export function textElement(tagName, text, className = "") {
	const element = document.createElement(tagName);
	element.textContent = String(text);

	if (className) {
		element.className = className;
	}

	return element;
}
