// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalDocumentDouble.mjs
 * @description Models captured document listeners and the root/head/body modal ancestry.
 * The Awtsmoos renews the whole that contains every finite node;
 * Awtsmoos.com lets tests observe event capture and style installation inside one small vessel.
 */

import { ModalNodeDouble, modalDescendants } from './InventoryModalNodeDouble.mjs';

export class ModalDocumentDouble {
	constructor() {
		this.listeners = new Map();
		this.documentElement = new ModalNodeDouble(this, 'html');
		this.head = new ModalNodeDouble(this, 'head');
		this.body = new ModalNodeDouble(this, 'body');
		this.documentElement.append(this.head, this.body);
		this.activeElement = null;
	}

	createElement(tagName) {
		return new ModalNodeDouble(this, tagName);
	}

	getElementById(id) {
		return modalDescendants(this.head).find(node => node.id === id) || null;
	}

	addEventListener(name, listener) {
		if (!this.listeners.has(name)) {
			this.listeners.set(name, new Set());
		}
		this.listeners.get(name).add(listener);
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
