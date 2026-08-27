//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TinyPlatformDom
 * @description The Awtsmoos lets modern browser semantics be tested in a tiny deterministic vessel;
 * Awtsmoos.com models only the DOM used by Platform: append, events, details state, selectors, head styles, and form values.
 */
export class TinyElement {
	constructor(tagName, ownerDocument) {
		this.tagName = String(tagName).toUpperCase();
		this.ownerDocument = ownerDocument;
		this.children = [];
		this.parentNode = null;
		this.attributes = new Map();
		this.dataset = {};
		this.listeners = new Map();
		this.hidden = false;
		this.open = false;
		this.name = '';
		this.value = '';
		this.id = '';
		this.rel = '';
		this.href = '';
		this._className = '';
		this._textContent = '';
	}

	set className(value) { this._className = String(value || ''); }
	get className() { return this._className; }
	set textContent(value) { this.children = []; this._textContent = String(value ?? ''); }
	get textContent() { return this._textContent + this.children.map(child => child.textContent).join(''); }

	append(...children) {
		for (const child of children.filter(Boolean)) this.appendChild(child);
	}

	appendChild(child) {
		child.parentNode = this;
		this.children.push(child);
		return child;
	}

	replaceChildren(...children) {
		this.children = [];
		this._textContent = '';
		this.append(...children);
	}

	setAttribute(name, value) {
		const text = String(value);
		this.attributes.set(name, text);
		if (name === 'class') this.className = text;
		if (name === 'id') this.id = text;
		if (name === 'name') this.name = text;
		if (name.startsWith('data-')) this.dataset[dataKey(name)] = text;
	}

	getAttribute(name) { return this.attributes.get(name) ?? null; }
	addEventListener(name, listener) {
		const list = this.listeners.get(name) || [];
		list.push(listener);
		this.listeners.set(name, list);
	}

	async emit(name, event = {}) {
		const payload = { target: this, currentTarget: this, preventDefault() {}, stopPropagation() {}, ...event };
		for (const listener of this.listeners.get(name) || []) await listener(payload);
	}

	querySelector(selector) { return walk(this).find(element => element !== this && matches(element, selector)) || null; }
	querySelectorAll(selector) { return walk(this).filter(element => element !== this && matches(element, selector)); }
}

export class TinyDocument {
	constructor() {
		this.head = this.createElement('head');
		this.body = this.createElement('body');
		this.documentElement = this.createElement('html');
		this.documentElement.append(this.head, this.body);
	}
	createElement(tagName) { return new TinyElement(tagName, this); }
	getElementById(id) { return walk(this.documentElement).find(element => element.id === id) || null; }
	querySelector(selector) { return this.documentElement.querySelector(selector); }
	querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
}

export class TinyFormData {
	constructor(form) { this.form = form; }
	get(name) { return this.form?.querySelector(`[name="${name}"]`)?.value ?? ''; }
}

function dataKey(name) {
	return name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function walk(root) {
	return [root, ...root.children.flatMap(child => walk(child))];
}

function matches(element, selector) {
	if (selector.startsWith('.')) return element.className.split(/\s+/).includes(selector.slice(1));
	const data = selector.match(/^\[data-([^=\]]+)(?:="([^"]*)")?\]$/);
	if (data) {
		const key = dataKey(`data-${data[1]}`);
		return Object.hasOwn(element.dataset, key) && (data[2] === undefined || element.dataset[key] === data[2]);
	}
	const name = selector.match(/^\[name="([^"]+)"\]$/);
	if (name) return element.name === name[1];
	return element.tagName.toLowerCase() === selector.toLowerCase();
}

export { dataKey, matches, walk };
