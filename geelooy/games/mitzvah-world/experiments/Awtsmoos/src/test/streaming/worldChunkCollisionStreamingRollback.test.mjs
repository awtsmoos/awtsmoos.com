// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionStreamingRollback.test.mjs
 * @description Proves cancellation and failure preserve parent-only ownership.
 * The Awtsmoos never abandons the traveler between vessels; Awtsmoos.com releases
 * unfinished generation and discards concealed children whenever proof cannot finish.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { GENERATED_PARENT_ID } from './WorldChunkCollisionGeneratedFixture.mjs';
import {
	advanceCollisionStreamingToReady,
	advanceCollisionStreamingToState,
	createCollisionStreamingFixture
} from './WorldChunkCollisionStreamingFixture.mjs';

test('cancellation during bounded generation leaves parent-only ownership', () => {
	const fixture = createCollisionStreamingFixture();
	fixture.runtime.request({
		requestId: 'rollback-generating',
		at: 10,
		maximumGenerationUnits: 4
	});
	fixture.runtime.update({ at: 11 });
	for (let at = 12; at <= 16; at += 1) {
		fixture.runtime.update({ at, maximumGenerationUnits: 4 });
	}
	assert.equal(fixture.runtime.cancel({ reason: 'generation-cancel', at: 17 }).accepted, true);
	const cancelled = fixture.runtime.update({ at: 17 });
	assert.equal(cancelled.operation, 'cancel-generation');
	assert.equal(cancelled.state, 'cancelled');
	assert.deepEqual(cancelled.ownership.activeIds, [GENERATED_PARENT_ID]);
	assert.equal(cancelled.ownership.prepared, 0);
	assert.equal(cancelled.job.rollback, null);
	assert.equal(fixture.facade.all([]).length, fixture.triangles.length);
});

test('cancellation after partial validation discards every concealed child', () => {
	const fixture = createCollisionStreamingFixture();
	const advanced = advanceCollisionStreamingToState(fixture, 'prepared', {
		requestId: 'rollback-partial'
	});
	fixture.runtime.update({ at: advanced.at });
	fixture.runtime.update({ at: advanced.at + 1 });
	assert.equal(fixture.index.diagnostics().validated, 2);
	const cancelAt = advanced.at + 2;
	assert.equal(fixture.runtime.cancel({ reason: 'test-cancel', at: cancelAt }).accepted, true);
	const cancelled = fixture.runtime.update({ at: cancelAt });
	assert.equal(cancelled.state, 'cancelled');
	assert.deepEqual(cancelled.ownership.activeIds, [GENERATED_PARENT_ID]);
	assert.equal(cancelled.ownership.prepared, 0);
	assert.deepEqual(cancelled.job.rollback.leakedIds, []);
});

test('injected generation failure never mutates parent ownership', () => {
	const fixture = createCollisionStreamingFixture({
		generate() {
			throw new Error('generated failure');
		}
	});
	fixture.runtime.request({ requestId: 'rollback-generation', at: 10 });
	assert.equal(fixture.runtime.update({ at: 11 }).state, 'generating');
	const failed = fixture.runtime.update({ at: 12 });
	assert.equal(failed.state, 'failed');
	assert.equal(failed.job.error.message, 'generated failure');
	assert.deepEqual(failed.ownership.activeIds, [GENERATED_PARENT_ID]);
	assert.equal(failed.ownership.prepared, 0);
});

test('retained activation rejects cancellation and preserves the parent', () => {
	const fixture = createCollisionStreamingFixture();
	const advanced = advanceCollisionStreamingToReady(fixture, 'rollback-retained');
	const cancellation = fixture.runtime.cancel({
		reason: 'too-late',
		at: advanced.at
	});
	assert.equal(cancellation.accepted, false);
	assert.equal(cancellation.reason, 'retained-activation-already-visible');
	assert.deepEqual(fixture.facade.diagnostics().ownerIds, [GENERATED_PARENT_ID]);
	assert.equal(fixture.index.diagnostics().active, 9);
});
