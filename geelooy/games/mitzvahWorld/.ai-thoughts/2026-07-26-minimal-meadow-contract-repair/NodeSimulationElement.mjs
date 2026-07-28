// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationElement.mjs
 * @description Supplies forgiving DOM elements with document-aware descendants for Node game boot.
 * The Awtsmoos clothes browserless execution in finite handles while Awtsmoos.com preserves
 * every owner, host, event, descendant, mutation, and drawing doorway the real launcher expects.
 */

import {
	createSimulatedCanvasContext,
	createSimulatedClassList,
	createSimulatedStyle
} from './NodeSimulationDomPrimitives.mjs';

export class SimulatedElement {
	constructor(id = '', tagName = 'div') {
		this.id = id;
		this.tagName = String(tagName).toUpperCase();
		this.dataset = {};
		this.attributes = new Map();
		this.children = [];
		this.selectorChildren = new Map();
		this.ownerDocument = null;
		this.parentNode = null;
		this.textContent = '';
		this.innerHTML = '';
		this.value = 0;
		this.max = 100;
		this.hidden = false;
		this.width = 1280;
		this.height = 720;
		this.clientWidth = 1280;
		this.clientHeight = 720;
		this.listeners = new Map();
		this.style = createSimulatedStyle();
		this.classList = createSimulatedClassList();
		this.context2d = createSimulatedCanvasContext();
		this.context2d.canvas = this;
	}

	get firstChild() {
		return this.children[0] || null;
	}

	get firstElementChild() {
		return this.firstChild;
	}

	addEventListener(type, listener) {
		const listeners = this.listeners.get(type) || new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	dispatchEvent(event) {
		event.target ||= this;
		for (const listener of this.listeners.get(event.type) || []) {
			listener.call(this, event);
		}
		return true;
	}

	append(...values) {
		for (const value of values) {
			this.addValue(value, false);
		}
	}

	prepend(...values) {
		for (const value of [...values].reverse()) {
			this.addValue(value, true);
		}
	}

	replaceChildren(...values) {
		for (const child of this.children) {
			child.parentNode = null;
		}
		this.children = [];
		this.selectorChildren.clear();
		this.textContent = '';
		this.append(...values);
	}

	addValue(value, atBeginning) {
		if (typeof value === 'string') {
			this.textContent = atBeginning
				? `${value}${this.textContent}`
				: `${this.textContent}${value}`;
			return;
		}
		this.insertBefore(value, atBeginning ? this.firstChild : null);
	}

	appendChild(child) {
		return this.insertBefore(child, null);
	}

	insertBefore(child, reference) {
		child.parentNode = this;
		child.ownerDocument ||= this.ownerDocument;
		const index = reference ? this.children.indexOf(reference) : -1;
		if (index < 0) this.children.push(child);
		else this.children.splice(index, 0, child);
		return child;
	}

	removeChild(child) {
		this.children = this.children.filter((value) => value !== child);
		child.parentNode = null;
		return child;
	}

	remove() {
		this.parentNode?.removeChild(this);
	}

	contains(child) {
		return child === this || this.children.includes(child);
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	removeAttribute(name) {
		this.attributes.delete(name);
	}

	querySelector(selector) {
		if (!this.selectorChildren.has(selector)) {
			const child = new SimulatedElement('', selector.includes('knob') ? 'i' : 'div');
			child.ownerDocument = this.ownerDocument;
			child.parentNode = this;
			this.selectorChildren.set(selector, child);
			this.children.push(child);
		}
		return this.selectorChildren.get(selector);
	}

	querySelectorAll() {
		return [...this.selectorChildren.values()];
	}

	closest() {
		return this;
	}

	getContext(name) {
		return name === '2d' ? this.context2d : null;
	}

	getBoundingClientRect() {
		return {
			bottom: 720,
			height: 720,
			left: 0,
			right: 1280,
			top: 0,
			width: 1280,
			x: 0,
			y: 0
		};
	}

	focus() {}
	blur() {}
	click() {
		this.dispatchEvent({ type: 'click' });
	}
	setPointerCapture() {}
	releasePointerCapture() {}
	requestPointerLock() {}
}
