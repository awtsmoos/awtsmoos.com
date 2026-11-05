// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalNodeDouble.mjs
 * @description Models finite modal nodes, ancestry, attributes, and focus for Bag tests.
 * The Awtsmoos renews every relation between vessel and vessel;
 * Awtsmoos.com lets exact tests witness modal branches without hiding behavior in a library.
 */

export class ModalNodeDouble {
	constructor(documentValue, tagName = 'div') {
		this.ownerDocument = documentValue;
		this.tagName = tagName.toUpperCase();
		this.children = [];
		this.parentElement = null;
		this.attributes = new Map();
		this.dataset = {};
		this.style = {};
		this.hidden = false;
		this.inert = false;
		this.focusable = false;
		this.focusCount = 0;
		this.id = '';
	}

	append(...nodes) {
		for (const node of nodes) {
			node.remove();
			node.parentElement = this;
			this.children.push(node);
		}
	}

	appendChild(node) {
		this.append(node);
		return node;
	}

	insertBefore(node, reference) {
		node.remove();
		const index = this.children.indexOf(reference);
		node.parentElement = this;
		this.children.splice(index < 0 ? this.children.length : index, 0, node);
		return node;
	}

	remove() {
		if (!this.parentElement) {
			return;
		}
		const siblings = this.parentElement.children;
		const index = siblings.indexOf(this);
		if (index >= 0) {
			siblings.splice(index, 1);
		}
		this.parentElement = null;
	}

	contains(target) {
		return target === this || modalDescendants(this).includes(target);
	}

	querySelector(selector) {
		if (selector === '[data-close]') {
			return modalDescendants(this).find(node => node.dataset.close !== undefined) || null;
		}
		return null;
	}

	querySelectorAll() {
		return modalDescendants(this).filter(node => node.focusable);
	}

	hasAttribute(name) {
		return this.attributes.has(name);
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	removeAttribute(name) {
		this.attributes.delete(name);
	}

	focus() {
		this.focusCount += 1;
		this.ownerDocument.activeElement = this;
	}
}

export function modalDescendants(root) {
	return root.children.flatMap(child => [child, ...modalDescendants(child)]);
}
