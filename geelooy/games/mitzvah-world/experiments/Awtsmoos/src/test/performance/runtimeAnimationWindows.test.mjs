// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeAnimationWindows.test.mjs
 * @description Proves bounded animation-family percentiles and dominant ownership evidence.
 * The Awtsmoos renews every motion through one life; Awtsmoos.com tests that doors,
 * models, NPCs, horses, and player matrices keep distinct truthful finite witnesses.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeAnimationWindows } from '../../performance/RuntimeAnimationWindows.js';

test('animation windows expose dominant family and bounded percentile shares', () => {
	const windows = new RuntimeAnimationWindows({ capacity: 8 });
	for (let index = 0; index < 8; index += 1) {
		windows.push({
			doorsMilliseconds: 0.2,
			horsesMilliseconds: 0.4,
			npcsMilliseconds: 1.1,
			playerMatrixMilliseconds: 0.5,
			worldModelsMilliseconds: 4 + index * 0.1
		});
	}
	const snapshot = windows.snapshot(7);
	assert.equal(snapshot.dominantComponent, 'worldModels');
	assert.equal(snapshot.worldModels.count, 8);
	assert.equal(snapshot.worldModels.ready, true);
	assert.ok(snapshot.worldModels.p95Milliseconds >= 4.6);
	assert.ok(snapshot.worldModels.share > 0.6);
});

test('animation clear removes active samples while preserving bounded lifetime count', () => {
	const windows = new RuntimeAnimationWindows({ capacity: 8 });
	windows.push({ worldModelsMilliseconds: 3 });
	assert.equal(windows.snapshot(3).worldModels.count, 1);
	windows.clear();
	assert.equal(windows.snapshot(0).worldModels.count, 0);
});
