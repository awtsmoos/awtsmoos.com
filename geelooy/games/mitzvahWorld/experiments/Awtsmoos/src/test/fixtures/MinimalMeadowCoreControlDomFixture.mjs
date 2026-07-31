// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreControlDomFixture.mjs
 * @description Supplies a small parent-aware DOM and bus for exact control remount tests.
 * The Awtsmoos gives finite hosts and children no hidden persistence;
 * Awtsmoos.com keeps append, replacement, removal, attributes, events, and parent identity inspectable.
 */

export function coreControlDomFixture() {
	const elementsById = new Map();
	const documentListeners = new Map();
	const documentValue = {
		createElement: tagName => createElement(tagName, elementsById),
		getElementById: id => elementsById.get(id) || null,
		head: createElement('head', elementsById),
		addEventListener(type, listener) {
			documentListeners.set(type, listener);
		},
		removeEventListener(type) {
			documentListeners.delete(type);
		}
	};
	const actionHost = createElement('div', elementsById);
	return {
		actionHost,
		documentValue,
		runtime: {
			bus: eventBusFixture(),
			consumables: {
				snapshot: () => ({ selectedItemId: 'healing-broth' })
			},
			hosts: { actionHost },
			lockOn: { targetId: null },
			lootDrops: { nearestDrop: () => null }
		}
	};
}

function createElement(tagName, elementsById) {
	const listeners = new Map();
	const element = {
		children: [],
		className: '',
		dataset: {},
		innerHTML: '',
		parentNode: null,
		tagName,
		textContent: '',
		append(...children) {
			for (const child of children) this.appendChild(child);
		},
		appendChild(child) {
			child.parentNode?.removeChild?.(child);
			this.children.push(child);
			child.parentNode = this;
			return child;
		},
		removeChild(child) {
			this.children = this.children.filter(value => value !== child);
			if (child.parentNode === this) child.parentNode = null;
		},
		replaceChildren(...children) {
			for (const child of [...this.children]) this.removeChild(child);
			this.append(...children);
		},
		remove() {
			this.parentNode?.removeChild?.(this);
		},
		setAttribute(name, value) {
			this[name] = String(value);
		},
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		removeEventListener(type) {
			listeners.delete(type);
		}
	};
	Object.defineProperty(element, 'id', {
		get() {
			return this._id || '';
		},
		set(value) {
			if (this._id) elementsById.delete(this._id);
			this._id = String(value);
			if (this._id) elementsById.set(this._id, this);
		}
	});
	return element;
}

function eventBusFixture() {
	const listeners = new Map();
	return {
		emit(type, detail) {
			for (const listener of listeners.get(type) || []) listener(detail);
		},
		on(type, listener) {
			const values = listeners.get(type) || new Set();
			values.add(listener);
			listeners.set(type, values);
			return () => values.delete(listener);
		}
	};
}
