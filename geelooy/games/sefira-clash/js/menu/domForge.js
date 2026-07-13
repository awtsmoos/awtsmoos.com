//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the dom forge vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Forges DOM from data.
 *
 * Chapter 107: a null attribute must not become a cursed boolean. The victory
 * buttons were disabled because `disabled: null` still wrote the disabled
 * attribute. This forge skips falsey/null attributes and missing handlers, so
 * declarative UI can breathe without accidental locks.
 *
 * @param {object|string|Node} node - Declarative node, live node, or text.
 * @returns {Node} A live DOM node.
 */
export function forge(node) {
	if (node instanceof Node) return node;
	if (typeof node === 'string') return document.createTextNode(node);
	const el = document.createElement(node.tag || 'div');
	applyAttrs(el, node.attrs || {});
	applyEvents(el, node.on || {});
	for (const child of node.children || []) el.appendChild(forge(child));
	return el;
}

/**
 * B"H
 * Replaces all children with one revealed structure.
 *
 * @param {Element} host - Container receiving the new palace.
 * @param {object|string|Node} node - Declarative DOM tree or live node.
 * @returns {Node} The appended node.
 */
export function reveal(host, node) {
	host.replaceChildren();
	const made = forge(node);
	host.appendChild(made);
	return made;
}

function applyAttrs(el, attrs) {
	for (const [key, value] of Object.entries(attrs)) {
		if (value === null || value === undefined || value === false) continue;
		if (key === 'class') el.className = value;
		else if (key === 'dataset') Object.assign(el.dataset, value);
		else if (value === true) el.setAttribute(key, '');
		else el.setAttribute(key, value);
	}
}

function applyEvents(el, events) {
	for (const [event, handler] of Object.entries(events)) {
		if (typeof handler === 'function') el.addEventListener(event, handler);
	}
}
