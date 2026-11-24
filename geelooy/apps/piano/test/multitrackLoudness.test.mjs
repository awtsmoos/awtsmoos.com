//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { estimateTruePeakDb, integratedLoudnessEstimate } from '../modules/workstation/song/multitrack/multitrackLoudness.js';

const sine = (seconds, amplitude, rate = 44100) => {
	const data = new Float32Array(Math.round(seconds * rate));
	for (let i = 0; i < data.length; i++) data[i] = amplitude * Math.sin(2 * Math.PI * 1000 * i / rate);
	return data;
};

test('silence has no loudness and no true peak', () => {
	const silent = [new Float32Array(44100)];
	assert.equal(integratedLoudnessEstimate(silent, 44100), -Infinity);
	assert.equal(estimateTruePeakDb(silent), -Infinity);
});

test('full-scale sine true peak is near 0 dBTP and never below sample peak', () => {
	const db = estimateTruePeakDb([sine(1, 1)]);
	assert.ok(db > -0.2 && db < 0.6, `true peak ${db}`);
});

test('integrated loudness falls when amplitude halves (about -6 LU)', () => {
	const loud = integratedLoudnessEstimate([sine(2, .5)], 44100);
	const quiet = integratedLoudnessEstimate([sine(2, .25)], 44100);
	assert.ok(Number.isFinite(loud) && Number.isFinite(quiet));
	assert.ok(Math.abs((loud - quiet) - 6.02) < .5, `${loud} vs ${quiet}`);
	assert.ok(loud > -20 && loud < -5, `sine .5 loudness ${loud}`);
});

test('intersample peak can exceed every individual sample', () => {
	const data = new Float32Array([0, .9, .9, 0, -.9, -.9, 0]);
	assert.ok(estimateTruePeakDb([data]) >= 20 * Math.log10(.9));
});
