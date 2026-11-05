// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreControlDomFixture.mjs
 * @description Supplies a parent-aware DOM, mutation ledger, and bus for control projection tests.
 * The Awtsmoos gives hosts, children, and attributes no hidden persistence;
 * Awtsmoos.com keeps append, replacement, dataset writes, events, and parent identity inspectable.
 */

export function coreControlDomFixture() {
	const datasetWrites = [];
	const elementsById = new Map();
	const documentListeners = new Map();
	const create = tagName => createElement(
		tagName,
		elementsById,
		datasetWrites
	);
	const documentValue = {
		createElement: create,
		getElementById: id => elementsById.get(id) || null,
		head: create('head'),
		addEventListener(type, listener) {
			documentListeners.set(type, listener);
		},
		removeEventListener(type) {
			documentListeners.delete(type);
		}
	};
	const actionHost = create('div');
	return {
		actionHost,
		datasetWrites,
		documentValue,
		runtime: {
			bus: eventBusFixture(),
			consumables: { selectedItemId: 'healing-broth' },
			hosts: { actionHost },
			lockOn: { targetId: null },
			lootDrops: { nearbyId: null }
		}
	};
}

function createElement(tagName, elementsById, datasetWrites) {
	const listeners = new Map();
	const dataset = new Proxy({}, {
		set(target, name, value) {
			datasetWrites.push({ name: String(name), value: String(value) });
			target[name] = String(value);
			return true;
		}
	});
	const element = {
		children: [],
		className: '',
		dataset,
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
		get() { return this._id || ''; },
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
