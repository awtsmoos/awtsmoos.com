// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file seriesKeyCompleteness.test.js
 * @description Proves routed keys replace a legacy list only as a strict,
 * complete superset, preserving every Awtsmoos.com post identity.
 */

const assert = require("node:assert/strict");
const { completeSeriesKeys, isStrictSuperset } = require("../seriesKeyCompleteness.js");

function context(routed) {
	return {
		$i: {
			db: {
				__awtsmoosDbFsRouter: {
					maybe: async (operation, path) => {
						assert.equal(operation, "getObjectKeys");
						assert.equal(path, "social/heichelos/ikar/series/example/posts");
						return routed;
					}
				}
			}
		},
		heichelId: "ikar",
		seriesId: "example"
	};
}

(async () => {
	assert.equal(isStrictSuperset(["a", "b"], ["a", "b", "c"]), true);
	assert.equal(isStrictSuperset(["a", "x"], ["a", "b", "c"]), false);
	assert.equal(isStrictSuperset(["a", "b"], ["b", "a"]), false);

	const upgraded = await completeSeriesKeys({
		...context(["a", "b", "c"]),
		legacyIds: ["b", "a"]
	});
	assert.deepEqual(upgraded, { ids: ["a", "b", "c"], upgraded: true });

	const preserved = await completeSeriesKeys({
		...context(["a", "c"]),
		legacyIds: ["a", "b"]
	});
	assert.deepEqual(preserved, { ids: ["a", "b"], upgraded: false });

	console.log('B"H seriesKeyCompleteness.test passed');
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
