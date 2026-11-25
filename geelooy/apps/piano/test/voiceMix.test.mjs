//B"H
import test from 'node:test';
import assert from 'node:assert/strict';
import { mixStemChannels, levelZone, classifyLevelCheck, countInBeats } from '../modules/recording/voiceMix.js';

const sine = (freq, sr, n, amp = 0.5) => Float32Array.from({ length: n }, (_, i) => amp * Math.sin(2 * Math.PI * freq * i / sr));
const energy = (data, freq, sr) => {
	let re = 0, im = 0;
	for (let i = 0; i < data.length; i++) { const a = 2 * Math.PI * freq * i / sr; re += data[i] * Math.cos(a); im -= data[i] * Math.sin(a); }
	return Math.sqrt(re * re + im * im) / data.length;
};

test('voice-only balance: piano stem vanishes, voice remains', () => {
	const sr = 8000, n = 4000;
	const voice = [sine(400, sr, n)], piano = [sine(110, sr, n)];
	const { channels } = mixStemChannels({ voice, piano, voiceGain: 1, pianoGain: 0, channels: 1 });
	assert.ok(energy(channels[0], 400, sr) > 0.2);
	assert.ok(energy(channels[0], 110, sr) < 0.001);
});

test('piano-only balance: voice stem vanishes, piano remains', () => {
	const sr = 8000, n = 4000;
	const voice = [sine(400, sr, n)], piano = [sine(110, sr, n)];
	const { channels } = mixStemChannels({ voice, piano, voiceGain: 0, pianoGain: 1, channels: 1 });
	assert.ok(energy(channels[0], 110, sr) > 0.2);
	assert.ok(energy(channels[0], 400, sr) < 0.001);
});

test('50/50 balance keeps both stems and respects offsets', () => {
	const sr = 8000, n = 2000;
	const voice = [sine(400, sr, n)], piano = [sine(110, sr, n)];
	const { channels, length } = mixStemChannels({ voice, piano, voiceGain: 0.5, pianoGain: 0.5, voiceOffset: 100, pianoOffset: 0, channels: 1 });
	assert.equal(length, 2100);
	assert.ok(energy(channels[0], 400, sr) > 0.05);
	assert.ok(energy(channels[0], 110, sr) > 0.05);
});

test('level zones and level-check verdicts', () => {
	assert.equal(levelZone(0.2), 'green');
	assert.equal(levelZone(0.7), 'yellow');
	assert.equal(levelZone(0.95), 'red');
	assert.equal(levelZone(0.99), 'clip');
	assert.equal(classifyLevelCheck({ peak: 0.5, rms: 0.1, clippedBlocks: 0 }), 'good');
	assert.equal(classifyLevelCheck({ peak: 0.03, rms: 0.002, clippedBlocks: 0 }), 'too-quiet');
	assert.equal(classifyLevelCheck({ peak: 1, rms: 0.6, clippedBlocks: 3 }), 'too-loud');
});

test('count-in beats follow the tempo', () => {
	assert.deepEqual(countInBeats(60, 4), [0, 1, 2, 3]);
	assert.deepEqual(countInBeats(120, 2), [0, 0.5]);
});
