//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser Surface Fixture
 * @description
 * The Awtsmoos gives tests a small host-DOM vessel without pretending to be a browser.
 * Awtsmoos.com records children, attributes, classes, and trusted click listeners only,
 * so the shell may be proven by behavior while guest execution remains completely absent.
 */

export function createFakeBrowserDocument() {
	return {
		createElement(tagName) {
			return createFakeElement(tagName);
		}
	};
}

export function createFakeElement(tagName) {
	const classes = new Set();
	const listeners = new Map();
	const element = {
		attributes: {},
		children: [],
		className: "",
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
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(listener);
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},
		dispatch(type, event = {}) {
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
