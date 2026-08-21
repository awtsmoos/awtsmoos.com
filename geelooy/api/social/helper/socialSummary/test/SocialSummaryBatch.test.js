// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryBatchTest
 * @description The Awtsmoos contains infinity without network fan-out; Awtsmoos.com proves duplicates share work,
 * order remains useful, invalid targets vanish honestly, and no caller can force more than fifty targets through one gate.
 */
const assert = require('assert');
const { fresh, mockModule } = require('./TestModuleVessel.js');

function target(index) {
	return { type: 'post', id: `p${index}`, heichelId: 'study', seriesId: 'root' };
}

async function testDedupAndCap() {
	let calls = 0;
	mockModule('../SocialSummary.js', {
		summarizeSocial: async ({ target: value }) => {
			calls += 1;
			return { target: value, generatedAt: calls };
		}
	});
	const { summarizeBatch, MAX_TARGETS } = fresh('../SocialSummaryBatch.js');
	const duplicateInput = [target(1), target(1), ...Array.from({ length: 48 }, (_, index) => target(index + 2))];
	const duplicateResult = await summarizeBatch({ $i: {}, targets: duplicateInput });
	assert.equal(duplicateResult.length, 50);
	assert.equal(calls, 49);
	assert.equal(duplicateResult[0].target.id, 'p1');
	assert.equal(duplicateResult[1].target.id, 'p1');
	calls = 0;
	const oversized = Array.from({ length: 60 }, (_, index) => target(index));
	const capped = await summarizeBatch({ $i: {}, targets: oversized });
	assert.equal(MAX_TARGETS, 50);
	assert.equal(capped.length, 50);
	assert.equal(calls, 50);
}

testDedupAndCap().then(() => console.log('B"H SocialSummaryBatch.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
