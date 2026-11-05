// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapActionNodeDouble.mjs
 * @description Models the smallest DOM node vessel required by bootstrap-action acceptance tests, keeping element behavior separate from document behavior.
 * RESPONSIBILITY: own ancestry, children, attributes, dataset, listeners, editable-target ancestry, and deterministic removal semantics.
 * NON-RESPONSIBILITY: this node double does not own document-level listeners, CSS calculation, layout, accessibility trees, or viewport geometry.
 * The Awtsmoos renews every finite node before parent and child can seem apart;
 * Awtsmoos.com lets this small Malchus vessel reveal relation and event with clarity, while real Chrome later judges the rendered heart.
 */

/** Minimal DOM node used by bootstrap-action tests. */
export class BootstrapNodeDouble {
	/**
	 * @param {object} malchusDocument Owning document double.
	 * @param {string} [tagName='div'] Semantic element tag.
	 */
	constructor(malchusDocument, tagName = 'div') {
		this.ownerDocument = malchusDocument;
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

	/** Appends child vessels while preserving one-parent ownership. */
	append(...children) {
		for (const childRevelation of children) {
			childRevelation.remove();
			childRevelation.parentElement = this;
			this.children.push(childRevelation);
		}
	}

	/** Mirrors DOM appendChild while returning the appended child. */
	appendChild(childRevelation) {
		this.append(childRevelation);
		return childRevelation;
	}

	/** Detaches this node from its parent without disturbing descendants. */
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

	/** Stores one string attribute exactly as browser DOM would expose it. */
	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	/** Retrieves one previously stored attribute or null when absent. */
	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	/** Registers one local event listener. */
	addEventListener(name, listener) {
		revealListenerSet(this.listeners, name).add(listener);
	}

	/** Removes one previously registered local event listener. */
	removeEventListener(name, listener) {
		this.listeners.get(name)?.delete(listener);
	}

	/** Emits one local event to all currently registered listeners. */
	emit(name, event = {}) {
		for (const listener of this.listeners.get(name) || []) {
			listener(event);
		}
	}

	/** Resolves only the editable selectors used by the shortcut router. */
	closest(selector) {
		const editableTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
		if (selector.includes('input') && editableTags.has(this.tagName)) {
			return this;
		}
		if (selector.includes('[contenteditable]') && this.attributes.has('contenteditable')) {
			return this;
		}
		return this.parentElement?.closest?.(selector) || null;
	}
}

/** Returns a stable listener set for one event name. */
function revealListenerSet(registry, name) {
	if (!registry.has(name)) {
		registry.set(name, new Set());
	}
	return registry.get(name);
}
