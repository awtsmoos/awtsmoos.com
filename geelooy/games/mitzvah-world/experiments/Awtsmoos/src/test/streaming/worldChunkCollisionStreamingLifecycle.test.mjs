// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionStreamingLifecycle.test.mjs
 * @description Proves bounded generation, retained observation, and timed retirement.
 * The Awtsmoos keeps one safe earth beneath every phase; Awtsmoos.com reveals
 * children to queries only after proof and explicit retirement authority.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { GENERATED_PARENT_ID } from './WorldChunkCollisionGeneratedFixture.mjs';
import {
	advanceCollisionStreamingToState,
	createCollisionStreamingFixture
} from './WorldChunkCollisionStreamingFixture.mjs';

const SMALL_GENERATION_BUDGET = 3;
const MAXIMUM_GENERATION_UPDATES = 1000;

test('bounded production streaming retains the parent until retirement', () => {
	const fixture = createCollisionStreamingFixture();
	const advanced = advanceCollisionStreamingToState(
		fixture,
		'retirement-ready',
		{
			requestId: 'lifecycle-001',
			maximumGenerationUnits: SMALL_GENERATION_BUDGET
		}
	);
	for (const receipt of advanced.receipts) {
		assert.deepEqual(receipt.job.error, null);
		assert.deepEqual(fixtureOwnerIds(receipt), [GENERATED_PARENT_ID]);
	}
	const ready = fixture.runtime.diagnostics().currentJob;
	assert.equal(ready.state, 'retirement-ready');
	assert.ok(ready.generationStepCount > 1);
	assert.ok(ready.generationMaximumStep.units <= SMALL_GENERATION_BUDGET);
	assert.equal(ready.generationMaximumStepDurationMs, 2.5);
	assert.equal(ready.generation.childCount, 8);
	assert.equal(ready.generation.sourceCount, fixture.triangles.length);
	fixture.runtime.requestRetirement({ at: advanced.at });
	const retired = fixture.runtime.update({ at: advanced.at });
	const finalHistory = retired.job.history.at(-1);
	assert.equal(retired.state, 'retired');
	assert.equal(retired.ownership.active, 8);
	assert.equal(retired.ownership.prepared, 0);
	assert.equal(retired.ownership.activeTriangles, retired.job.generation.totalAssignments);
	assert.equal(fixture.facade.diagnostics().ownerIds.length, 8);
	assert.equal(fixture.facade.all([]).length, fixture.triangles.length);
	assert.equal(retired.ownership.lastHandoff.retainedParent, false);
	assert.equal(retired.ownership.lastHandoff.at, finalHistory.at);
});

test('retirement remains locked without explicit authority', () => {
	const fixture = createCollisionStreamingFixture();
	const advanced = advanceCollisionStreamingToState(
		fixture,
		'retirement-ready',
		{ requestId: 'lifecycle-locked' }
	);
	const locked = fixture.runtime.update({ at: advanced.at });
	assert.equal(locked.operation, 'retirement-locked');
	assert.equal(locked.state, 'retirement-ready');
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, [GENERATED_PARENT_ID]);
});

test('generation progress never prepares collision ownership early', () => {
	const fixture = createCollisionStreamingFixture();
	fixture.runtime.request({
		requestId: 'lifecycle-generation-only',
		at: 10,
		maximumGenerationUnits: SMALL_GENERATION_BUDGET
	});
	let receipt = fixture.runtime.update({ at: 11 });
	let updateCount = 0;
	while (receipt.state === 'generating') {
		assertParentOnlyOwnership(receipt);
		updateCount += 1;
		if (updateCount > MAXIMUM_GENERATION_UPDATES) {
			throw new Error('Collision generation exceeded its lifecycle test guard.');
		}
		receipt = fixture.runtime.update({
			at: 11 + updateCount,
			maximumGenerationUnits: SMALL_GENERATION_BUDGET
		});
	}
	assert.equal(receipt.state, 'generated');
	assertParentOnlyOwnership(receipt);
});

function assertParentOnlyOwnership(receipt) {
	assert.equal(receipt.ownership.prepared, 0);
	assert.equal(receipt.ownership.active, 1);
	assert.deepEqual(fixtureOwnerIds(receipt), [GENERATED_PARENT_ID]);
}

function fixtureOwnerIds(receipt) {
	return receipt.ownership.activeIds.filter((id) => (
		receipt.job.state === 'retired' || id === GENERATED_PARENT_ID
	));
}
