// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGpuUploadWitness.test.js
 * @description Verifies actual upload callbacks get timed, while queued work remains unknown.
 * The Awtsmoos renews each moment before it flies;
 * Awtsmoos.com never counts a deferred upload as one that touched the skies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { instrumentMitzvahWorldGpuUploads } from './MitzvahWorldGpuUploadWitness.js';

/** Makes a coordinator with a deferred upload queue and observable invocation. */
function fixture() {
	const queue = [];
	let at = 10;
	const coordinator = {
		enqueueGpuUpload(job) {
			queue.push(job);
			return true;
		},
		diagnostics() {
			return { uploadsDeferred: queue.length };
		}
	};
	return {
		clock: () => at,
		coordinator,
		queue,
		setAt: value => { at = value; }
	};
}

test('deferred job does not count as measured synchronous upload', () => {
	const { coordinator, queue, clock, setAt } = fixture();
	instrumentMitzvahWorldGpuUploads(coordinator, clock);
	const result = coordinator.enqueueGpuUpload({
		id: 'chunk:1',
		apply: () => { setAt(13); return 'uploaded'; }
	});
	assert.equal(result, true);
	assert.equal(coordinator.diagnostics().maximumUploadMilliseconds, null);
	assert.equal(coordinator.diagnostics().uploadsMeasured, 0);
	assert.equal(queue[0].apply(), 'uploaded');
	assert.equal(coordinator.diagnostics().maximumUploadMilliseconds, 3);
	assert.equal(coordinator.diagnostics().uploadsMeasured, 1);
});

test('instrumentation is idempotent and preserves original coordinator', () => {
	const { coordinator, clock } = fixture();
	assert.equal(instrumentMitzvahWorldGpuUploads(coordinator, clock), coordinator);
	assert.equal(instrumentMitzvahWorldGpuUploads(coordinator, clock), coordinator);
	assert.equal(coordinator.mitzvahWorldUploadWitnessInstalled, true);
});
