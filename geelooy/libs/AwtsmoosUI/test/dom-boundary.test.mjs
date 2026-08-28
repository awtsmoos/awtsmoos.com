//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file dom-boundary.test.mjs
 * @description
 * The Awtsmoos renews the final crossing from JSON intention into browser-like manifestation;
 * Awtsmoos.com proves safe attributes, styles, bindings, and named actions survive without unsafe mutation.
 */

import assert from 'node:assert/strict';
import { AwtsmoosUiElement } from '../src/render/AwtsmoosUiElement.js';

class FakeStyle {
	constructor() {
		this.values = new Map();
	}

	setProperty(name, value) {
		this.values.set(name, value);
	}
}

class FakeElement {
	constructor(tag) {
		this.tag = tag;
		this.attributes = new Map();
		this.listeners = new Map();
		this.style = new FakeStyle();
		this.className = '';
		this.textContent = '';
		this.value = '';
		this.checked = false;
		this.disabled = false;
	}

	setAttribute(name, value) {
		this.attributes.set(name, value);
	}

	addEventListener(name, handler) {
		this.listeners.set(name, handler);
	}
}

const actionCalls = [];
const context = {
	document: {
		createElement: tag => new FakeElement(tag)
	},
	store: {
		get: (path, fallback) => path === 'field' ? 'bound value' : fallback
	},
	actions: {
		run: (action, runtime) => actionCalls.push({ action, runtime })
	},
	data: {
		scene: 'one'
	}
};

const element = AwtsmoosUiElement.create({
	tag: 'input',
	class: 'studio-input',
	title: 'Safe title',
	style: {
		backgroundColor: 'black'
	},
	text: 'Visible',
	'$bind': {
		value: 'field'
	},
	'$on': {
		input: 'updatePrompt'
	}
}, context);

assert.equal(element.tag, 'input');
assert.equal(element.className, 'studio-input');
assert.equal(element.attributes.get('title'), 'Safe title');
assert.equal(element.style.values.get('background-color'), 'black');
assert.equal(element.value, 'bound value');
assert.equal(element.textContent, 'Visible');
assert.equal(element.listeners.has('input'), true);
element.listeners.get('input')({ type: 'input' });
assert.equal(actionCalls[0].action, 'updatePrompt');
assert.equal(actionCalls[0].runtime.data.scene, 'one');

assert.throws(
	() => AwtsmoosUiElement.applyProperty(new FakeElement('a'), 'onclick', 'evil'),
	/Unsafe AwtsmoosUI attribute/
);
assert.throws(
	() => AwtsmoosUiElement.applyStyles(new FakeElement('div'), { backgroundImage: 'url(javascript:evil())' }),
	/Unsafe AwtsmoosUI style declaration/
);
assert.throws(
	() => AwtsmoosUiElement.applyBindings(new FakeElement('div'), { '$bind': { innerHTML: 'field' } }, context),
	/Unsafe AwtsmoosUI binding/
);
assert.throws(
	() => AwtsmoosUiElement.applyEvents(new FakeElement('div'), { '$on': { onclick: 'bad' } }, context),
	/Unsafe AwtsmoosUI event/
);
console.log('AwtsmoosUI DOM boundary passed.');
