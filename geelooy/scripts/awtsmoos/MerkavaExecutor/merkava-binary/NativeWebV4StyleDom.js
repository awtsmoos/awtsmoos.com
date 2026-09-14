//B"H
//Boruch Hashem
//Blessed be He

/**
 * Builds the minimal executor-owned DOM surface required by the standards CSS
 * matcher/cascade during native-web-v4 compilation. It does not borrow a host
 * DOM and preserves the numeric handles that the native runtime executes.
 * @param {Array<object>} nodes Handle-addressed compiler nodes.
 * @returns {{document:object,elements:Map<number,object>}} CSS compilation graph.
 */
function createNativeStyleDom(nodes = []) {
	const document = {
		activeElement: null,
		documentElement: null
	};
	const elements = new Map();
	for (const node of nodes) {
		elements.set(node.handle, createStyleElement(node, document));
	}
	for (const node of nodes) {
		linkStyleElement(node, elements);
	}
	const roots = [...elements.values()].filter(element => !element.parentNode);
	document.documentElement = roots.find(element => element.localName === "html")
		|| roots[0]
		|| null;
	return { document, elements };
}

/** Creates one CSS-matchable element from compiler IR without a host browser. */
function createStyleElement(node, document) {
	const attributes = { ...(node.attrs || {}) };
	const element = {
		attributes,
		checked: Object.prototype.hasOwnProperty.call(attributes, "checked"),
		children: [],
		className: attributes.class || "",
		disabled: Object.prototype.hasOwnProperty.call(attributes, "disabled"),
		id: node.id || "",
		localName: node.tag,
		nodeType: 1,
		ownerDocument: document,
		parentNode: null,
		selected: Object.prototype.hasOwnProperty.call(attributes, "selected"),
		style: { toJSON: () => ({}) },
		tagName: String(node.tag || "div").toUpperCase(),
		textContent: node.text || ""
	};
	element.classList = {
		contains(name) {
			return splitCssWords(element.className).includes(String(name));
		}
	};
	element.getAttribute = name => attributeValue(element, name);
	element.hasAttribute = name => attributeValue(element, name) != null;
	return element;
}

/** Links numeric parent handles and materializes sibling navigation for CSS. */
function linkStyleElement(node, elements) {
	const element = elements.get(node.handle);
	if (!element) {
		return;
	}
	const parent = elements.get(node.parentHandle) || null;
	if (parent) {
		element.parentNode = parent;
		parent.children.push(element);
	}
	if (element.textContent) {
		element.children.push({
			children: [],
			nodeType: 3,
			parentNode: element,
			textContent: element.textContent
		});
	}
	refreshSiblingLinks(parent || element);
}

/** Updates explicit sibling pointers after each deterministic append. */
function refreshSiblingLinks(parent) {
	const children = parent?.children || [];
	for (let index = 0; index < children.length; index += 1) {
		children[index].previousSibling = children[index - 1] || null;
		children[index].nextSibling = children[index + 1] || null;
	}
}

/** Reads one case-insensitive HTML attribute from the compiler element. */
function attributeValue(element, name) {
	const key = String(name || "").toLowerCase();
	return Object.prototype.hasOwnProperty.call(element.attributes, key)
		? String(element.attributes[key])
		: null;
}

/** Splits CSS class whitespace without regular-expression dependencies. */
function splitCssWords(value) {
	return String(value || "").split(/\s+/).filter(Boolean);
}

module.exports = { createNativeStyleDom };
