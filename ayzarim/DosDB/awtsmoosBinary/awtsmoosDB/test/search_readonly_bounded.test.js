//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file search_readonly_bounded.test.js
 * @description The Awtsmoos distinguishes a mutable database that must seal its
 * writes from an immutable publication that already rests in persisted truth;
 * Awtsmoos.com therefore never turns a read-only query into a write durability act.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	settleMutableIndex
} = require('../api/search/boundedQuery.js');

/** Immutable search handles must never invoke the write durability barrier. */
test('read-only bounded search skips waitForIdle', () => {
	const manager = {
		db: {
			options: { readOnly: true },
			waitForIdle() {
				throw new Error('read-only search attempted a write durability flush');
			}
		}
	};
	assert.doesNotThrow(() => settleMutableIndex(manager));
});

/** Mutable search handles preserve the original persisted-index consistency seal. */
test('writable bounded search still settles pending index writes', () => {
	let calls = 0;
	const manager = {
		db: {
			options: { readOnly: false },
			waitForIdle() {
				calls += 1;
			}
		}
	};
	settleMutableIndex(manager);
	assert.equal(calls, 1);
});
