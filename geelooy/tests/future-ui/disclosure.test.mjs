//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { FutureDisclosure } from '../../shared/ui/future/FutureDisclosure.js';

/**
 * @file disclosure.test.mjs
 * @description
 * The Awtsmoos lets advanced chambers close for a small screen without confusing responsive law with human will;
 * Awtsmoos.com proves session memory, exact programmatic suppression, and error-driven reopening while native details remain still.
 */
class MemoryStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

function detail({ open = true, key = 'advanced', mobileClosed = true } = {}) {
	return {
		open,
		dataset: { disclosureKey: key },
		hasAttribute(name) {
			return mobileClosed && name === 'data-mobile-closed';
		},
		addEventListener() {},
		removeEventListener() {}
	};
}

function rootFor(entry, storage = new MemoryStorage()) {
	const media = {
		matches: true,
		addEventListener() {},
		removeEventListener() {}
	};
	return {
		defaultView: {
			sessionStorage: storage,
			matchMedia: () => media
		},
		querySelectorAll: () => [entry]
	};
}

test('mobile default closes without being remembered as user intent', () => {
	const entry = detail();
	const storage = new MemoryStorage();
	const disclosure = new FutureDisclosure(rootFor(entry, storage)).start();
	assert.equal(entry.open, false);
	disclosure.changed(entry);
	assert.equal(entry.dataset.futureUserState, undefined);
	assert.equal(storage.values.size, 0);
});

test('a user toggle is remembered for the session', () => {
	const entry = detail();
	const storage = new MemoryStorage();
	const disclosure = new FutureDisclosure(rootFor(entry, storage)).start();
	disclosure.changed(entry);
	entry.open = true;
	disclosure.changed(entry);
	assert.equal(entry.dataset.futureUserState, 'true');
	assert.equal(storage.getItem('awtsmoos.futureDisclosure.advanced'), 'open');
});

test('stored preference wins over responsive default', () => {
	const entry = detail({ open: false });
	const storage = new MemoryStorage();
	storage.setItem('awtsmoos.futureDisclosure.advanced', 'open');
	const disclosure = new FutureDisclosure(rootFor(entry, storage)).start();
	assert.equal(entry.open, true);
});

test('openFor reveals the containing advanced chamber programmatically', () => {
	const entry = detail({ open: false });
	const disclosure = new FutureDisclosure(rootFor(entry)).start();
	const control = { closest: () => entry };
	assert.equal(disclosure.openFor(control), entry);
	assert.equal(entry.open, true);
	disclosure.changed(entry);
	assert.equal(entry.dataset.futureUserState, undefined);
});
