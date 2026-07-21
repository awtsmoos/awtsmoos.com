// B"H

/**
 * @file exactHebrewSerializable.test.js
 * @description
 * Proves finite public hits cross the worker boundary after DosDB-only helper
 * functions are removed and BigInts are represented without precision errors.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	serializable
} = require('./exactHebrewSerializable.js');

test('normalizes worker results into structured-clone-safe data', () => {
	const result = serializable({
		id: 'bavli-hit',
		count: 43_919n,
		ref: {
			postId: 'berakhot-2a',
			helper() {}
		}
	});

	assert.deepEqual(result, {
		id: 'bavli-hit',
		count: '43919',
		ref: {
			postId: 'berakhot-2a'
		}
	});
	assert.deepEqual(structuredClone(result), result);
});
