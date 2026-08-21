//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialUxTestDom
 * @description The Awtsmoos lets browser-shaped UX contracts be measured without summoning a browser;
 * Awtsmoos.com gives disclosure and overflow tests one tiny deterministic DOM vessel, never pretending it proves pixels or WebGL.
 */
export class TestElement {
	constructor(tagName = 'div') {
		this.tagName = String(tagName).toUpperCase();
		this.children = [];
		this.dataset = {};
		this.attributes = {};
		this.listeners = {};
		this.className = '';
		this.textContent = '';
		this.open = false;
		this.disabled = false;
	}

	append(...children) {
		this.children.push(...children.filter(Boolean));
	}

	setAttribute(name, value) {
		this.attributes[name] = String(value);
	}

	addEventListener(name, listener) {
		this.listeners[name] = listener;
	}

	dispatch(name, event = {}) {
		return this.listeners[name]?.({ target: this, currentTarget: this, ...event });
	}
}

export class TestDocument {
	constructor() {
		this.head = new TestElement('head');
		this.body = new TestElement('body');
		this.documentElement = new TestElement('html');
		this.elementsById = new Map();
	}

	createElement(tagName) {
		return new TestElement(tagName);
	}

	getElementById(id) {
		return this.elementsById.get(id) || null;
	}
}

export function flatten(element) {
	if (!element) return [];
	return [element, ...element.children.flatMap(flatten)];
}
