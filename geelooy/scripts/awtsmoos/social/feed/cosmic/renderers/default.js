// B"H
// Boruch Hashem
// Blessed is He
/**
 * Even an unfamiliar vessel is sustained by the Awtsmoos. This Awtsmoos.com
 * fallback refuses to discard meaning merely because the record type is new.
 */

import { createElement } from "../dom.js";

/**
 * Renders unknown feed objects as complete readable content.
 * @param {Document} documentRef Active document.
 * @param {Record<string, unknown>} model Card model.
 * @returns {HTMLElement}
 */
export function renderDefault(documentRef, model) {
	const root = createElement(documentRef, "div", "cosmic-default-content");
	root.append(createElement(documentRef, "p", "cosmic-body-paragraph", {
		text: model.body || model.summary || "Open this living source to explore its complete content."
	}));
	return root;
}
