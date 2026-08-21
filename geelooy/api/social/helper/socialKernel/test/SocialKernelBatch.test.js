// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelBatchTest
 * @description The Awtsmoos contains number without fan-out, while Awtsmoos.com bounds the network vessel to twenty-five;
 * duplicates share hydration work, request order survives, and oversized callers cannot summon an accidental server hive.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

function target(index) {
	return { type: 'post', id: `p${index}`, heichelId: 'study', seriesId: 'root' };
}

async function run() {
	let calls = 0;
	mockFrom(__filename, '../SocialKernel.js', {
		socialKernelEntity: async ({ input }) => {
			calls += 1;
			return { entity: input };
		}
	});
	const batch = freshFrom(__filename, '../SocialKernelBatch.js');
	let results = await batch.socialKernelBatch({ $i: {}, targets: [target(1), target(1), target(2)] });
	assert.equal(results.length, 3);
	assert.equal(calls, 2);
	assert.equal(results[0].entity.id, 'p1');
	assert.equal(results[1].entity.id, 'p1');
	calls = 0;
	results = await batch.socialKernelBatch({ $i: {}, targets: Array.from({ length: 40 }, (_, index) => target(index)) });
	assert.equal(results.length, 25);
	assert.equal(calls, 25);
}

run().then(() => console.log('B"H SocialKernelBatch.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
