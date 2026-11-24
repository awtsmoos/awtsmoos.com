//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { eqResponseCurve, eqResponseDb, eqStages } from '../modules/workstation/song/multitrack/multitrackEqResponse.js';

test('flat EQ is 0 dB everywhere and allocates no stages', () => {
	assert.deepEqual(eqStages({}), []);
	for (const f of [20, 100, 1000, 10000]) assert.ok(Math.abs(eqResponseDb({}, f)) < 1e-9);
});

test('mid boost peaks near its center frequency', () => {
	const at = eqResponseDb({ midGain: 12, midFrequency: 1000, midQ: 1 }, 1000);
	assert.ok(at > 11 && at <= 12.01, `center ${at}`);
	assert.ok(Math.abs(eqResponseDb({ midGain: 12, midFrequency: 1000 }, 30)) < 1);
});

test('high-pass attenuates far below its cutoff', () => {
	assert.ok(eqResponseDb({ highpass: 1000 }, 100) < -20);
	assert.ok(Math.abs(eqResponseDb({ highpass: 1000 }, 15000)) < .5);
});

test('curve is finite, log-spaced and bounded', () => {
	const curve = eqResponseCurve({ lowGain: 6, highGain: -6, midGain: 3 });
	assert.equal(curve.length, 48);
	assert.ok(curve.every((p) => Number.isFinite(p.db)));
	assert.ok(curve[0].frequency === 20 && curve.at(-1).frequency === 20000);
});
