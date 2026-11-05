// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioUiActionRegistry } from '../../movie/MovieStudioUiActionRegistry.js';

class FakeElement extends EventTarget {
	constructor(tagName, attributes = {}, values = {}) {
		super();
		this.tagName = tagName.toUpperCase();
		this.attributes = Object.entries(attributes).map(([name, value]) => ({ name, value }));
		this.dataset = {};
		for (const [name, value] of Object.entries(attributes)) {
			if (name.startsWith('data-')) this.dataset[toDataset(name)] = value;
		}
		Object.assign(this, values);
	}
	getAttribute(name) { return this.attributes.find(item => item.name === name)?.value ?? null; }
	click() { this.dispatchEvent(new Event('click', { bubbles: true })); }
}

class FakeRoot {
	constructor(elements) { this.elements = elements; }
	querySelectorAll() { return this.elements; }
}

test('UI registry lists and invokes human controls through browser events', () => {
	const button = new FakeElement('button', { 'data-play': '', 'aria-label': 'Play' });
	const input = new FakeElement('input', { 'data-preview-zoom': '' }, { type: 'range', value: '1' });
	let clicks = 0;
	let changes = 0;
	button.addEventListener('click', () => { clicks += 1; });
	input.addEventListener('change', () => { changes += 1; });
	const registry = new MovieStudioUiActionRegistry(new FakeRoot([button, input]), { Event });
	assert.equal(registry.list().length, 2);
	assert.equal(registry.invoke('play').ok, true);
	assert.equal(registry.invoke('preview-zoom', { value: 2 }).ok, true);
	assert.equal(clicks, 1);
	assert.equal(changes, 1);
	assert.equal(input.value, '2');
});

function toDataset(name) {
	return name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
