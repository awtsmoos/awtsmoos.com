//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { limitTruePeakChannels, measureTruePeakLinear, oversampledPeakOf } from '../modules/workstation/song/multitrack/multitrackTruePeakLimiter.js';

const SR = 44100;
/** Sine at fs/4 phase-shifted by 45°: sample peak is cos(45°) of the true peak. */
function intersampleSignal(seconds = .25, amplitude = .95) {
	const data = new Float32Array(Math.floor(SR * seconds));
	for (let i = 0; i < data.length; i++) data[i] = amplitude * Math.sin((Math.PI / 4) * i + Math.PI / 8);
	return data;
}

test('oversampled detection catches an inter-sample peak the samples hide', () => {
	const data = intersampleSignal();
	let samplePeak = 0;
	for (const value of data) samplePeak = Math.max(samplePeak, Math.abs(value));
	assert.ok(samplePeak < .89, `sample peak ${samplePeak}`);
	assert.ok(oversampledPeakOf(data) > .92, `oversampled peak ${oversampledPeakOf(data)}`);
	assert.ok(measureTruePeakLinear([data]) > .9);
});

test('limiter brings the hidden inter-sample peak under the ceiling and keeps the signal', () => {
	const data = intersampleSignal();
	const report = limitTruePeakChannels([data], SR, { ceilingDb: -1 });
	const ceiling = 10 ** (-1 / 20);
	assert.ok(report.afterTruePeakDb <= -0.99, `after ${report.afterTruePeakDb} dBTP`);
	assert.ok(measureTruePeakLinear(report.channels) <= ceiling * 1.002);
	assert.ok(report.beforeTruePeakDb > -0.75);
	assert.ok(report.maxGainReductionDb < -0.3, `GR ${report.maxGainReductionDb}`);
	// Signal is limited, not silenced: RMS stays substantial.
	let sum = 0; for (const value of report.channels[0]) sum += value * value;
	assert.ok(Math.sqrt(sum / report.channels[0].length) > .4);
	// Original array untouched.
	assert.ok(Math.abs(data[1]) > .6);
});

test('limiter leaves a quiet signal bit-identical', () => {
	const data = new Float32Array(SR / 10);
	for (let i = 0; i < data.length; i++) data[i] = .1 * Math.sin(2 * Math.PI * 440 * i / SR);
	const report = limitTruePeakChannels([data], SR, { ceilingDb: -1 });
	assert.equal(report.maxGainReductionDb, 0);
	assert.deepEqual([...report.channels[0].slice(0, 100)], [...data.slice(0, 100)]);
});

test('limiter tames a full-scale square-ish signal in stereo, linked', () => {
	const left = new Float32Array(SR / 10).fill(.99);
	const right = new Float32Array(SR / 10).fill(-.5);
	const report = limitTruePeakChannels([left, right], SR, { ceilingDb: -3 });
	assert.ok(report.afterTruePeakDb <= -2.99, `after ${report.afterTruePeakDb}`);
});
