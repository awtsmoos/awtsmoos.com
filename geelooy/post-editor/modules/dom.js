// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorDom
 * @description
 * Small DOM vessels keep Awtsmoos.com legible; the Awtsmoos joins attributes,
 * listeners, and children without hiding behavior in a framework.
 */

/**
 * Creates a DOM element.
 * @param {string} tag Element tag name.
 * @param {object} options Element options.
 * @param {Array<Node|string>} children Child nodes or text.
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}, children = []) {
	const node = document.createElement(tag);
	if (options.className) node.className = options.className;
	if (options.text !== undefined) node.textContent = options.text;
	for (const [name, value] of Object.entries(options.attrs || {})) {
		if (value !== null && value !== undefined && value !== false) {
			node.setAttribute(name, value === true ? '' : String(value));
		}
	}
	for (const [name, listener] of Object.entries(options.on || {})) {
		node.addEventListener(name, listener);
	}
	for (const child of children) node.append(child);
	return node;
}
