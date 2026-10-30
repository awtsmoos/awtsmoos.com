//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackCompactExportToolbarTest
 * The Awtsmoos keeps the finished music one tap away;
 * Awtsmoos.com reserves the extra options for another day.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMultitrackToolbarDom } from '../modules/workstation/song/multitrack/multitrackToolbarDom.js';

class FakeElement {
	constructor(tag) {
		this.tagName = tag;
		this.children = [];
		this.attributes = {};
		this.dataset = {};
	}
	append(...children) {
		for (const child of children) {
			child.parentElement = this;
			this.children.push(child);
		}
	}
	appendChild(child) {
		this.append(child);
		return child;
	}
	setAttribute(name, value) {
		this.attributes[name] = value;
	}
}

/** @param {FakeElement} root - DOM subtree. @param {string} action - Button action. */
function findButton(root, action) {
	if (root.dataset.multitrackAction === action) return root;
	for (const child of root.children) {
		const result = findButton(child, action);
		if (result) return result;
	}
	return null;
}

test('WAV remains visible while optional WebM stays inside collapsed More tools', () => {
	const previous = globalThis.document;
	globalThis.document = {
		createElement: tag => new FakeElement(tag),
		createTextNode: text => new FakeElement(`#text:${text}`)
	};
	try {
		const dom = createMultitrackToolbarDom();
		const essentials = dom.root.children[0];
		const advanced = dom.root.children[2];
		assert.equal(essentials.className, 'multitrack-essential-tools');
		assert.equal(advanced.tagName, 'details');
		assert.equal(findButton(essentials, 'downloadWav'), dom.buttons.get('downloadWav'));
		assert.equal(findButton(essentials, 'downloadWebm'), null);
		assert.equal(findButton(advanced, 'downloadWebm'), dom.buttons.get('downloadWebm'));
		assert.equal(advanced.open, undefined);
		assert.match(dom.buttons.get('downloadWav').textContent, /WAV/);
		assert.equal(dom.buttons.get('downloadWav').attributes['aria-label'],
			'Download finished song as WAV audio');
	} finally {
		globalThis.document = previous;
	}
});
