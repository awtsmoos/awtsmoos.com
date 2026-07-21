/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives each fake element only the powers its tests truly need; Awtsmoos.com mirrors classes, parents, selectors, canvases, and geometry without pretending to be a full browser.
*/
export class FakeElement {
	constructor(id, tag = 'div') {
		this.id = id;
		this.tagName = tag.toUpperCase();
		this.children = [];
		this.dataset = {};
		this.style = { setProperty(name, value) { this[name] = value; } };
		this.listeners = {};
		this.value = '';
		this.textContent = '';
		this.innerHTML = '';
		this.hidden = false;
		this.disabled = false;
		this.files = [];
		this.className = '';
		this.classList = classList(this);
		this.width = 1280;
		this.height = 720;
		this.scrollTop = 0;
	}

	append(...nodes) {
		nodes.forEach((node) => {
			node.parentNode = this;
			node.parentElement = this;
			this.children.push(node);
		});
	}

	appendChild(node) { this.append(node); return node; }
	remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((child) => child !== this); }
	addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
	dispatchEvent(event) { (this.listeners[event.type] || []).forEach((callback) => callback(event)); }
	click() { return this.onclick?.({ target: this, preventDefault() {}, stopPropagation() {} }); }
	querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
	querySelectorAll(selector) { return descendants(this).filter((element) => matches(element, selector)); }
	getContext() { return fakeContext(this); }
	getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; }
	setPointerCapture() {}
	setAttribute(name, value) { this[name] = value; }
	scrollIntoView() {}
	closest(selector) {
		const dataKey = selector.match(/data-([\w-]+)/)?.[1]?.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
		if (dataKey && this.dataset[dataKey]) return this;
		const tags = selector.split(',').map((item) => item.trim().toUpperCase());
		return tags.includes(this.tagName) ? this : null;
	}
}

export function tagFor(id) {
	if (/Canvas$|^stage$/.test(id)) return 'canvas';
	if (/File$|Width|Height|fps|crop|Bars|Text|Url|Sensitivity|Density|Flow/i.test(id)) return 'input';
	if (/Profile|Preset|Provider|Family|Input|Ratio/i.test(id)) return 'select';
	if (/CustomJs/.test(id)) return 'textarea';
	if (/Output/.test(id)) return 'pre';
	return 'div';
}

function descendants(root) { return root.children.flatMap((child) => [child, ...descendants(child)]); }
function matches(element, selector) { return selector === 'input' ? element.tagName === 'INPUT' : selector.startsWith('.') && element.classList.contains(selector.slice(1)); }
function classList(element) {
	return {
		add: (...names) => element.className = words(element, ...names).join(' '),
		remove: (...names) => element.className = words(element).filter((word) => !names.includes(word)).join(' '),
		contains: (name) => words(element).includes(name),
		toggle: (name, force) => toggleClass(element, name, force)
	};
}
function toggleClass(element, name, force) { const active = words(element).includes(name); if (force === false || active && force !== true) classList(element).remove(name); else classList(element).add(name); }
function words(element, ...additions) { return [...new Set(`${element.className || ''} ${additions.join(' ')}`.trim().split(/\s+/).filter(Boolean))]; }
function fakeContext(canvas) { const gradient = { addColorStop() {} }; return new Proxy({ canvas, measureText: (text) => ({ width: String(text).length * 8 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient }, { get: (target, property) => property in target ? target[property] : () => {} }); }
