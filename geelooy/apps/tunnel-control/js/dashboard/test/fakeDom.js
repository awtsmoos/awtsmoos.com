// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos grants tests a small DOM vessel so Awtsmoos.com dashboard shape
 * can be verified without pretending a full browser exists.
 */

export class FakeClassList {
	constructor() {
		this.items = new Set();
	}

	add(...items) {
		for (const item of items.filter(Boolean)) {
			this.items.add(item);
		}
	}

	remove(...items) {
		for (const item of items) {
			this.items.delete(item);
		}
	}

	contains(item) {
		return this.items.has(item);
	}
}

export class FakeNode {
	constructor(tag = "div") {
		this.tag = tag;
		this.children = [];
		this.classList = new FakeClassList();
		this.attrs = {};
		this.dataset = {};
		this.textContent = "";
	}

	append(...children) {
		this.children.push(...children);
	}

	replaceChildren(...children) {
		this.children = children;
	}

	setAttribute(key, value) {
		this.attrs[key] = String(value);
		if (key.startsWith("data-")) {
			const dataKey = key.slice(5).replace(
				/-./g,
				function camelCase(match) {
					return match[1].toUpperCase();
				}
			);
			this.dataset[dataKey] = String(value);
		}
	}

	setAttributeNS(_namespace, key, value) {
		this.setAttribute(key, value);
	}

	addEventListener() {
		return undefined;
	}
}

/** @returns {void} Installs the test DOM globals. */
export function installFakeDom() {
	globalThis.Node = FakeNode;
	globalThis.document = {
		createElement(tag) {
			return new FakeNode(tag);
		},
		createElementNS(_namespace, tag) {
			return new FakeNode(tag);
		},
		createTextNode(text) {
			const node = new FakeNode("#text");
			node.textContent = String(text);
			return node;
		},
		dispatchEvent() {
			return true;
		}
	};
	globalThis.localStorage = {
		getItem() {
			return null;
		},
		setItem() {
			return undefined;
		}
	};
}

/**
 * Returns every descendant in document order.
 *
 * @param {FakeNode} node Root node.
 * @returns {FakeNode[]} Flattened nodes.
 */
export function walkNodes(node) {
	const descendants = (node.children || []).flatMap(
		function walkChild(child) {
			if (typeof child !== "object") {
				return [];
			}
			return walkNodes(child);
		}
	);
	return [node, ...descendants];
}
