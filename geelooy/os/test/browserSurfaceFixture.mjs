//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Browser Surface Fixture
 * @description
 * Minimal deterministic host-DOM vessel for Geelooy Browser tests. It implements only
 * the DOM powers production host rendering consumes: children, attributes, classes,
 * trusted listeners, dataset, properties, and explicit event dispatch.
 */

/**
 * Creates a document-like fixture whose elements preserve renderer-observable state.
 * @returns {{createElement(tagName:string):Object}} Deterministic fake document.
 */
export function createFakeBrowserDocument() {
	return {
		createElement(tagName) {
			return createFakeElement(tagName);
		}
	};
}

/**
 * Creates one fake browser-owned host node.
 * @param {string} tagName Requested tag name.
 * @returns {Object} Node-like test record implementing the trusted renderer contract.
 */
export function createFakeElement(tagName) {
	const classes = new Set();
	const listeners = new Map();	const element = {
		attributes: {},
		children: [],
		dataset: {},
		hidden: false,
		tagName: String(tagName).toUpperCase(),
		textContent: "",
		value: "",
		append(...children) {
			this.children.push(...children);
		},
		appendChild(child) {
			this.children.push(child);
			return child;
		},
		setAttribute(name, value) {
			this.attributes[name] = String(value);
		},
		getAttribute(name) {
			return this.attributes[name] ?? null;
		},
		addEventListener(type, listener) {
			if (!listeners.has(type)) {
				listeners.set(type, new Set());
			}
			listeners.get(type).add(listener);
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},		dispatch(type, event = {}) {
			for (const listener of listeners.get(type) || []) {
				listener({ target: this, ...event });
			}
		}
	};
	Object.defineProperty(element, "className", {
		get() {
			return Array.from(classes).join(" ");
		},
		set(value) {
			classes.clear();
			for (const name of String(value || "").split(/\s+/).filter(Boolean)) {
				classes.add(name);
			}
		}
	});
	element.classList = {
		add(...names) {
			for (const name of names) {
				classes.add(name);
			}
		},
		contains(name) {
			return classes.has(name);
		},
		toggle(name, force) {
			const shouldHave = force === undefined ? !classes.has(name) : Boolean(force);
			if (shouldHave) classes.add(name);
			else classes.delete(name);
			return shouldHave;
		}
	};
	return element;
}
