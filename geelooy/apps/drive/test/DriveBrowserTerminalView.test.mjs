// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { DriveBrowserTerminalView } from '../js/views/DriveBrowserTerminalView.js';

/**
 * @file DriveBrowserTerminalView.test.mjs
 * @description Proves identity resolution removes Drive's loading garment completely.
 */

class FakeElement {
	constructor() {
		this.attributes = new Map();
		this.children = [];
		this.textContent = '';
		this.className = '';
		this.disabled = false;
		this.title = '';
	}

	append(...children) {
		this.children.push(...children);
	}

	replaceChildren(...children) {
		this.children = children;
	}

	removeAttribute(name) {
		this.attributes.delete(name);
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	hasAttribute(name) {
		return this.attributes.has(name);
	}
}

function fakeDocument() {
	const nodes = new Map([
		['#entry-rows', new FakeElement()],
		['#drive-item-count', new FakeElement()],
		['#drive-location', new FakeElement()],
		['#path-back', new FakeElement()]
	]);
	return {
		nodes,
		querySelector(selector) {
			return nodes.get(selector) || null;
		},
		createElement() {
			return new FakeElement();
		}
	};
}

const documentRef = fakeDocument();
const host = documentRef.nodes.get('#entry-rows');
host.setAttribute('aria-busy', 'true');
host.replaceChildren(Object.assign(new FakeElement(), { className: 'drive-skeleton' }));

documentRef.nodes.get('#drive-item-count').textContent = 'Loading…';
new DriveBrowserTerminalView(documentRef).renderIdentityRequired();

assert.equal(host.hasAttribute('aria-busy'), false);
assert.equal(host.children.length, 1);
assert.equal(host.children[0].className, 'drive-empty');
assert.equal(host.children[0].children[0].textContent, 'Choose an account to open Drive');
assert.equal(documentRef.nodes.get('#drive-item-count').textContent, 'Account required');
assert.equal(documentRef.nodes.get('#drive-location').textContent, 'My Drive');
assert.equal(documentRef.nodes.get('#path-back').disabled, true);
assert.doesNotMatch(JSON.stringify(host.children), /drive-skeleton/);

console.log('B"H DriveBrowserTerminalView.test passed');
