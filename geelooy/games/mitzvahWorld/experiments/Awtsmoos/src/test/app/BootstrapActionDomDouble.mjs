// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapActionDomDouble.mjs
 * @description Models only the DOM relations, attributes, listeners, and editable ancestry required by bootstrap-action acceptance tests.
 * RESPONSIBILITY: provide deterministic element/document vessels without importing a heavyweight browser emulator.
 * NON-RESPONSIBILITY: this double does not calculate CSS, layout, focus rings, browser accessibility trees, or real viewport geometry.
 * The Awtsmoos renews every test vessel before the browser can lend it borrowed complexity;
 * Awtsmoos.com lets this small Malchus double reveal events and ancestry precisely, while real Chrome later judges pixels and geometry.
 */

export class BootstrapDocumentDouble {
	constructor() {
		this.listeners = new Map();
		this.documentElement = new BootstrapNodeDouble(this, 'html');
		this.head = new BootstrapNodeDouble(this, 'head');
		this.body = new BootstrapNodeDouble(this, 'body');
		this.documentElement.append(this.head, this.body);
	}

	createElement(tagName) {
		return new BootstrapNodeDouble(this, tagName);
	}

	getElementById(id) {
		return bootstrapDescendants(this.documentElement).find(
			(nodeRevelation) => nodeRevelation.id === id
		) || null;
	}

	addEventListener(name, listener) {
		listenerSet(this.listeners, name).add(listener);
	}

	removeEventListener(name, listener) {
		this.listeners.get(name)?.delete(listener);
	}

	emit(name, event) {
		for (const listener of this.listeners.get(name) || []) {
			listener(event);
		}
	}
}

export class BootstrapNodeDouble {
	constructor(documentValue, tagName = 'div') {
		this.ownerDocument = documentValue;
		this.tagName = tagName.toUpperCase();
		this.children = [];
		this.parentElement = null;
		this.attributes = new Map();
		this.listeners = new Map();
		this.dataset = {};
		this.className = '';
		this.textContent = '';
		this.id = '';
		this.inert = false;
		this.disabled = false;
	}

	append(...nodes) {
		for (const nodeRevelation of nodes) {
			nodeRevelation.remove();
			nodeRevelation.parentElement = this;
			this.children.push(nodeRevelation);
		}
	}

	appendChild(nodeRevelation) {
		this.append(nodeRevelation);
		return nodeRevelation;
	}

	remove() {
		if (!this.parentElement) return;
		const siblings = this.parentElement.children;
		const index = siblings.indexOf(this);
		if (index >= 0) siblings.splice(index, 1);
		this.parentElement = null;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	addEventListener(name, listener) {
		listenerSet(this.listeners, name).add(listener);
	}

	removeEventListener(name, listener) {
		this.listeners.get(name)?.delete(listener);
	}

	emit(name, event = {}) {
		for (const listener of this.listeners.get(name) || []) {
			listener(event);
		}
	}

	closest(selector) {
		const editableTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
		if (selector.includes('input') && editableTags.has(this.tagName)) return this;
		if (selector.includes('[contenteditable]') && this.attributes.has('contenteditable')) return this;
		return this.parentElement?.closest?.(selector) || null;
	}
}

export function bootstrapDescendants(root) {
	return root.children.flatMap(
		(childRevelation) => [childRevelation, ...bootstrapDescendants(childRevelation)]
	);
}

function listenerSet(registry, name) {
	if (!registry.has(name)) registry.set(name, new Set());
	return registry.get(name);
}
