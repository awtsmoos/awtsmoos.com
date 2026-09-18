//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file seriesReadSingleEnumeration.test.cjs
 * @description
 * The Awtsmoos lets one reconciled key list illuminate Awtsmoos.com once;
 * this regression guards against reopening the same cold routed collection twice.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { readPostsCompatible } = require('../seriesReadCompatibility.js');

/** Builds an ordinary-series context whose public DosDB read is already complete. */
function createContext() {
	const calls = { publicKeys: 0, routedKeys: 0 };
	const ids = ['post-a', 'post-b'];
	const context = {
		$i: {
			db: {
				__awtsmoosDbFsRouter: {
					async maybe() {
						calls.routedKeys += 1;
						return [...ids];
					}
				},
				async getObjectKeys() {
					calls.publicKeys += 1;
					return [...ids];
				}
			}
		},
		heichelId: 'ikar',
		seriesId: 'berakhot',
		withDetails: false
	};
	return { calls, context, ids };
}

test('ordinary series uses one public completeness-reconciled key enumeration', async () => {
	const { calls, context, ids } = createContext();
	const result = await readPostsCompatible(context);
	assert.deepEqual(result, ids);
	assert.equal(calls.publicKeys, 1);
	assert.equal(calls.routedKeys, 0);
});
