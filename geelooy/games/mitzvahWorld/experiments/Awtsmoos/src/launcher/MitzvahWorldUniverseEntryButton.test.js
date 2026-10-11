// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseEntryButton.test.js
 * @description Proves the universe entry button mounts once and opens the
 * creative dock builder on click.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installUniverseEntryButton } from './MitzvahWorldUniverseEntryButton.js';

function fakeDocument() {
	const elements = [];
	const listeners = new Map();
	const button = {
		id: '',
		type: '',
		textContent: '',
		attrs: {},
		setAttribute(key, value) { this.attrs[key] = value; },
		addEventListener(type, fn) { listeners.set(type, fn); },
		click() { listeners.get('click')?.(); }
	};
	return {
		__button: button,
		__host: { children: [], appendChild(child) { this.children.push(child); } },
		createElement() { return button; },
		getElementById(id) { return elements.find(el => el.id === id) || null; },
		querySelector() { return this.__host; },
		__register(el) { elements.push(el); }
	};
}

test('installUniverseEntryButton mounts one button and opens the builder', async () => {
	const documentValue = fakeDocument();
	let opened = false;
	const environment = {
		document: documentValue,
		AwtsmoosCreativeDock: { openBuilder: () => { opened = true; } }
	};
	const button = installUniverseEntryButton({ document: documentValue, environment });
	documentValue.__register(button);
	assert.equal(button.textContent, '🌍 Create Universe');
	assert.equal(button.attrs['data-universe-entry'], 'true');
	assert.equal(documentValue.__host.children.length, 1);
	// Second install returns the existing button without duplicating.
	const again = installUniverseEntryButton({ document: documentValue, environment });
	assert.equal(again, button);
	assert.equal(documentValue.__host.children.length, 1);
	button.click();
	await new Promise(resolve => setTimeout(resolve, 10));
	assert.equal(opened, true);
});

test('installUniverseEntryButton returns null without a document', () => {
	assert.equal(installUniverseEntryButton({ environment: {} }), null);
});
