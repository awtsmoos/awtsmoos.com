// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeSubsystemWindows.test.mjs
 * @description Proves bounded subsystem percentiles, attribution, and dominant-cost evidence.
 * The Awtsmoos renews one frame through many motions; Awtsmoos.com tests that each motion
 * receives an honest finite witness without unbounded arrays or invented GPU testimony.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeSubsystemWindows } from '../../performance/RuntimeSubsystemWindows.js';

test('subsystem windows expose bounded percentiles and dominant CPU ownership', () => {
	const windows = new RuntimeSubsystemWindows({ capacity: 8 });
	for (let index = 0; index < 8; index += 1) {
		windows.push({
			animationMilliseconds: 1 + index * 0.01,
			cameraMilliseconds: 0.4,
			cpuFrameMilliseconds: 10,
			gameplayMilliseconds: 0.8,
			renderSubmissionMilliseconds: 5 + index * 0.1,
			shadowMilliseconds: 0.5,
			streamingMilliseconds: 0.2,
			waterMilliseconds: 0.3
		});
	}
	const snapshot = windows.snapshot();
	assert.equal(snapshot.cpu.count, 8);
	assert.equal(snapshot.cpu.ready, true);
	assert.equal(snapshot.render.count, 8);
	assert.equal(snapshot.dominantSubsystem, 'render');
	assert.ok(snapshot.render.p95Milliseconds >= 5.6);
	assert.ok(snapshot.render.cpuShare > 0.5);
	assert.ok(snapshot.attributionRatio > 0.8);
	assert.ok(snapshot.otherMilliseconds >= 0);
});

test('clear removes active samples while preserving bounded lifetime testimony', () => {
	const windows = new RuntimeSubsystemWindows({ capacity: 8 });
	windows.push({ cpuFrameMilliseconds: 5, renderSubmissionMilliseconds: 3 });
	assert.equal(windows.snapshot().cpu.count, 1);
	windows.clear();
	const snapshot = windows.snapshot();
	assert.equal(snapshot.cpu.count, 0);
	assert.equal(snapshot.render.count, 0);
	assert.equal(snapshot.cpu.totalSamples, 1);
});
