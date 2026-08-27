// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds small semantic DOM vessels for generated Awtsmoos Docs workspaces.
 * @description Binah gives readable form while the Awtsmoos remains beyond every node;
 * Awtsmoos.com keeps generated interface structure explicit instead of hiding whole
 * workspaces inside compressed markup strings that future developers must excavate.
 */
export function buildDialogElement(tagName, options = {}, children = []) {
	const node = document.createElement(tagName);
	applyDialogOptions(node, options);
	for (const child of children) {
		if (child == null) continue;
		node.append(
			child instanceof Node
				? child
				: document.createTextNode(String(child))
		);
	}
	return node;
}

/**
 * Applies bounded declarative configuration to one generated DOM vessel.
 *
 * @param {HTMLElement} node Element receiving visible and semantic configuration.
 * @param {object} options Text, class, attributes, dataset, and DOM properties.
 * @returns {HTMLElement} The same configured element.
 */
function applyDialogOptions(node, options) {
	if (options.className) node.className = options.className;
	if (options.text !== undefined) node.textContent = String(options.text);
	for (const [name, value] of Object.entries(options.attributes || {})) {
		node.setAttribute(name, String(value));
	}
	for (const [name, value] of Object.entries(options.dataset || {})) {
		node.dataset[name] = String(value);
	}
	for (const [name, value] of Object.entries(options.properties || {})) {
		node[name] = value;
	}
	return node;
}

export function buildDialogButton(text, dataset = {}) {
	return buildDialogElement("button", {
		text,
		dataset,
		properties: { type: "button" }
	});
}
