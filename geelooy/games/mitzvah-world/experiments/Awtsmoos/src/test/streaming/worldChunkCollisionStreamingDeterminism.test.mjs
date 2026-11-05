// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionStreamingDeterminism.test.mjs
 * @description Proves equal sequence inputs yield equal progress and ownership.
 * The Awtsmoos renews equal worlds without disorder; Awtsmoos.com shows that seed,
 * geometry, request, unit budget, and time determine every collision transition.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	advanceCollisionStreamingToReady,
	createCollisionStreamingFixture
} from './WorldChunkCollisionStreamingFixture.mjs';

test('fresh runtimes produce identical retained-ready evidence', () => {
	const first = createCollisionStreamingFixture();
	const second = createCollisionStreamingFixture();
	advanceCollisionStreamingToReady(first, 'deterministic-001');
	advanceCollisionStreamingToReady(second, 'deterministic-001');
	assert.deepEqual(
		first.runtime.diagnostics().currentJob,
		second.runtime.diagnostics().currentJob
	);
	assert.deepEqual(first.index.diagnostics(), second.index.diagnostics());
	assert.deepEqual(
		first.facade.diagnostics().ownerIds,
		second.facade.diagnostics().ownerIds
	);
});

test('equal bounded updates produce identical progress at every step', () => {
	const first = createCollisionStreamingFixture();
	const second = createCollisionStreamingFixture();
	for (const fixture of [first, second]) {
		fixture.runtime.request({
			requestId: 'deterministic-progress',
			at: 10,
			maximumGenerationUnits: 5,
			sortRunSize: 4
		});
	}
	for (let at = 11; at <= 35; at += 1) {
		const firstReceipt = first.runtime.update({ at, maximumGenerationUnits: 5 });
		const secondReceipt = second.runtime.update({ at, maximumGenerationUnits: 5 });
		assert.deepEqual(firstReceipt.job, secondReceipt.job);
		assert.deepEqual(firstReceipt.ownership, secondReceipt.ownership);
	}
});

test('zero collision operation budget mutates nothing', () => {
	const fixture = createCollisionStreamingFixture();
	fixture.runtime.request({ requestId: 'deterministic-budget', at: 10 });
	const before = fixture.runtime.diagnostics().currentJob;
	const receipt = fixture.runtime.update({ at: 11, maximumOperations: 0 });
	assert.equal(receipt.operation, 'budget-exhausted');
	assert.deepEqual(fixture.runtime.diagnostics().currentJob, before);
});

test('zero generation units preserve a generating session', () => {
	const fixture = createCollisionStreamingFixture();
	fixture.runtime.request({
		requestId: 'deterministic-generation-budget',
		at: 10,
		maximumGenerationUnits: 5
	});
	fixture.runtime.update({ at: 11 });
	const before = fixture.runtime.diagnostics().currentJob;
	const receipt = fixture.runtime.update({ at: 12, maximumGenerationUnits: 0 });
	assert.equal(receipt.operation, 'generation-step');
	assert.equal(receipt.job.generationMaximumStep.units, 0);
	assert.equal(receipt.state, 'generating');
	assert.equal(receipt.ownership.prepared, 0);
	assert.equal(before.generationStepCount + 1, receipt.job.generationStepCount);
});

test('sequence time must remain nondecreasing', () => {
	const fixture = createCollisionStreamingFixture();
	fixture.runtime.request({ requestId: 'deterministic-time', at: 10 });
	fixture.runtime.update({ at: 11 });
	assert.throws(() => fixture.runtime.update({ at: 10.5 }), /nondecreasing/);
});
