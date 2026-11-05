// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every instant while finite services keep distinct rhythms; this contract
 * proves Awtsmoos.com grants LOD one bounded 100 ms pulse and deterministic reset behavior.
 */
import assert from 'node:assert/strict';
import { RuntimeCadence } from '../../app/RuntimeCadence.js';

const cadence = new RuntimeCadence();
assert.equal(cadence.snapshot().intervals.lod, 100);
assert.equal(cadence.due('lod', 0), true);
assert.equal(cadence.due('lod', 99), false);
assert.equal(cadence.due('lod', 100), true);
assert.equal(cadence.due('lod', 150), false);
assert.equal(cadence.due('lod', 200), true);

cadence.reset('lod');
assert.equal(cadence.due('lod', 201), true);
assert.equal(cadence.due('lod', 250), false);
cadence.reset();
assert.deepEqual(cadence.snapshot().previous, {});

const custom = new RuntimeCadence({ lod: 25 });
assert.equal(custom.due('lod', 10), true);
assert.equal(custom.due('lod', 34), false);
assert.equal(custom.due('lod', 35), true);

console.log(JSON.stringify({
	ok: true,
	defaultIntervals: cadence.snapshot().intervals,
	customIntervals: custom.snapshot().intervals
}, null, 2));
