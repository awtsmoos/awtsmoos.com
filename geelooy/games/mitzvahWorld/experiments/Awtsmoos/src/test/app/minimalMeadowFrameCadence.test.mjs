// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFrameCadence.test.mjs
 * @description Proves timer fallbacks never write HUD and painted frames use bounded refresh cadence.
 * The Awtsmoos renews simulation without needless visible labor; Awtsmoos.com keeps DOM writes
 * below frame rate while gameplay and rendering remain immediate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowLoopCadence } from '../../app/MinimalMeadowLoopCadence.js';

test('B"H HUD writes are paint-bound and cadence-limited', () => {
	const cadence = new MinimalMeadowLoopCadence();
	const counts = { bootstrap: 0, ui: 0 };
	const runtime = {
		bootstrapHud: { refresh: () => counts.bootstrap += 1 },
		ui: { refresh: () => counts.ui += 1 }
	};
	cadence.refresh(runtime, 0, 'animation-frame');
	assert.deepEqual(counts, { bootstrap: 1, ui: 1 });
	cadence.refresh(runtime, 50, 'animation-frame');
	cadence.refresh(runtime, 500, 'timer-fallback');
	assert.deepEqual(counts, { bootstrap: 1, ui: 1 });
	cadence.refresh(runtime, 100, 'animation-frame');
	assert.deepEqual(counts, { bootstrap: 1, ui: 2 });
	cadence.refresh(runtime, 180, 'animation-frame');
	assert.deepEqual(counts, { bootstrap: 2, ui: 2 });
	const evidence = cadence.diagnostics();
	assert.equal(evidence.uiInterval, 100);
	assert.equal(evidence.bootstrapHudInterval, 180);
});
