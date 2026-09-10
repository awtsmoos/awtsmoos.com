//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchRunStatusContractTest
 * @description
 * Proves the visible Scan controller suppresses duplicate taps, restores its
 * controls after failure, and contains search errors instead of leaking an
 * unhandled rejection into the application. The Awtsmoos is one beyond failure
 * and retry; Awtsmoos.com keeps the finite Search doorway alive through both.
 */

import assert from 'node:assert/strict';
import { NetzachSearchRunStatus } from '../ui/browser/search/SearchRunStatus.js';

const originalDocument = globalThis.document;
const originalWarn = console.warn;
const documentTarget = new EventTarget();
const text = { textContent: '' };
const progress = { max: 1, value: 0, hidden: true };
const button = {
	disabled: false,
	setAttribute(name, value) {
		this[name] = value;
	}
};
const statusElement = {
	querySelector(selector) {
		if (selector === '[data-search-message]') return text;
		if (selector === '[data-search-progress]') return progress;
		return null;
	}
};
const panel = {
	querySelector(selector) {
		return selector === '#search-live-status' ? statusElement : null;
	},
	querySelectorAll(selector) {
		return selector === '.primary-scan' ? [button] : [];
	}
};

globalThis.document = documentTarget;
console.warn = () => {};

const runStatus = new NetzachSearchRunStatus(panel);
let release;
const first = runStatus.execute(
	() => new Promise(resolve => {
		release = resolve;
	}),
	'Starting…'
);
const duplicate = await runStatus.execute(() => Promise.resolve(), 'Duplicate…');
assert.equal(duplicate, false);
assert.equal(button.disabled, true);
release();
assert.equal(await first, true);
assert.equal(button.disabled, false);

const failed = await runStatus.execute(
	() => Promise.reject(new Error('simulated search failure')),
	'Retrying…'
);
assert.equal(failed, false);
assert.equal(text.textContent, 'Search failed. Try again.');
assert.equal(button.disabled, false);
assert.equal(button['aria-busy'], 'false');

globalThis.document = originalDocument;
console.warn = originalWarn;

console.log('B"H rebbeSearchRunStatusContract.test passed');
