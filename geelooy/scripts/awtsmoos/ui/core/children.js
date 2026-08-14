// B"H
/**
 * @module AwtsmoosUiChildren
 * @description A parent receives its toldos in order. The module stays small so
 * child creation never disappears inside an untraceable monolith.
 */

/** Resolves and mounts an element according to the historic parent option. */
export function mountElement(ui, element, options = {}) {
	if (options.parent === null) return element;
	let parent = options.parent;
	if (typeof parent === 'string') parent = ui.getHtml(parent);
	if (!parent && options.parent === undefined) parent = document.body;
	if (parent instanceof Node) parent.append(element);
	return element;
}

/** Replaces or appends configured child descriptors. */
export function applyChildren(ui, element, options = {}) {
	let children = options.children ?? options.toldos;
	if (typeof children === 'function') children = children(ui.getHtml.bind(ui), ui);
	if (Array.isArray(children)) {
		element.replaceChildren();
		for (const child of children) appendChild(ui, element, child);
	}
	const single = options.child ?? options.tolda;
	if (single !== undefined && single !== null) appendChild(ui, element, single);
	return element;
}

function appendChild(ui, parent, child) {
	if (child === null || child === undefined || child === false) return;
	if (child instanceof Node) {
		parent.append(child);
		return;
	}
	if (typeof child === 'object') {
		ui.html({ ...child, parent });
		return;
	}
	parent.append(document.createTextNode(String(child)));
}
