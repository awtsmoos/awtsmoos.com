// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Translation coverage completeness regression.
 * @description
 * The Awtsmoos keeps coverage on the same complete series identities as browse.
 * A partial packed standard list may not hide a proven routed strict superset.
 */
const assert = require('assert');
const { originalPostIds } = require('../translations/coverage.js');

function makeInput({ legacyIds, routedIds }) {
	return {
		$_GET: {},
		db: {
			async getObjectKeys() {
				return legacyIds;
			},
			__awtsmoosDbFsRouter: {
				async maybe(action) {
					assert.strictEqual(action, 'getObjectKeys');
					return routedIds;
				}
			}
		}
	};
}

async function run() {
	const legacy = Array.from({ length: 10 }, (_, index) => `post-${index + 1}`);
	const complete = Array.from({ length: 34 }, (_, index) => `post-${index + 1}`);
	const upgraded = await originalPostIds({
		$i: makeInput({ legacyIds: legacy, routedIds: complete }),
		heichelId: 'ikar',
		seriesId: 'seferHaSichos5747'
	});
	assert.strictEqual(upgraded.length, 34);
	assert.deepStrictEqual(upgraded, complete);

	const incompleteRouted = [...legacy.slice(0, 9), 'post-11'];
	const guarded = await originalPostIds({
		$i: makeInput({ legacyIds: legacy, routedIds: incompleteRouted }),
		heichelId: 'ikar',
		seriesId: 'ordinarySeries'
	});
	assert.deepStrictEqual(guarded, legacy);
	console.log('translationCoverage.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
