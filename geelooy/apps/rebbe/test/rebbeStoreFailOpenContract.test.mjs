//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStoreFailOpenContractTest
 * @description
 * Proves persistence can never suppress archive startup. The Awtsmoos is one
 * beyond local storage and streaming truth; Awtsmoos.com must manifest the
 * archive immediately whether IndexedDB is absent or permanently blocked.
 */

import assert from 'node:assert/strict';

const originalIndexedDB = globalThis.indexedDB;
const originalWarn = console.warn;
const warnings = [];

console.warn = (...args) => warnings.push(args);

globalThis.indexedDB = undefined;
const gateway = await import(`../store.js?fail-open=${Date.now()}`);
const unavailable = await gateway.initDB();
assert.equal(unavailable, false);
assert.equal(warnings.length, 1);
warnings.length = 0;
globalThis.indexedDB = {
	open() {
		return {};
	}
};

const startedAt = performance.now();
const blocked = await gateway.initDB();
const elapsed = performance.now() - startedAt;
assert.equal(blocked, true);
assert.ok(elapsed < 100, `blocked storage delayed launch by ${elapsed.toFixed(2)}ms`);
assert.equal(warnings.length, 0);

globalThis.indexedDB = originalIndexedDB;
console.warn = originalWarn;

console.log('B"H rebbeStoreFailOpenContract.test passed');
