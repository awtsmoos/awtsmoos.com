// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadDom
 * @description
 * Tiny DOM vessels let the Awtsmoos.com conversation stay inspectable; the
 * Awtsmoos joins content without unsafe HTML interpolation.
 */

/** Creates a DOM element with attributes, listeners, and children. */
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
