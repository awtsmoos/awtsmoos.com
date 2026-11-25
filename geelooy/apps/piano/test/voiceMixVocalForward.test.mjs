//B"H
import test from "node:test";
import assert from "node:assert/strict";
import { amplitudeToDb, autoBalanceStems, measureStem, mixStemChannels } from "../modules/recording/voiceMix.js";
import { encodeMultitrackWav } from "../modules/workstation/song/multitrack/multitrackWavEncoder.js";

const SR = 8000;
const sine = (freq, n, amp) => Float32Array.from({ length: n }, (_, i) => amp * Math.sin(2 * Math.PI * freq * i / SR));
const bandEnergy = (data, freq) => {
	let re = 0, im = 0;
	for (let i = 0; i < data.length; i++) { const a = 2 * Math.PI * freq * i / SR; re += data[i] * Math.cos(a); im -= data[i] * Math.sin(a); }
	return Math.sqrt(re * re + im * im) / data.length;
};
const peakOf = (data) => data.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

// The reported bug, reproduced: quiet singing (amp 0.03) over loud piano (amp 0.6).
const voice = [sine(400, 8000, 0.03)];
const piano = [sine(110, 8000, 0.6)];

test("auto-balance makes the quiet voice clearly audible over loud piano (measured)", () => {
	const before = mixStemChannels({ voice, piano, voiceGain: 1, pianoGain: 0.85, channels: 1 }).channels[0];
	const beforeRatioDb = amplitudeToDb(bandEnergy(before, 400) / bandEnergy(before, 110));
	const balance = autoBalanceStems({ voice, piano });
	const after = mixStemChannels({ voice, piano, voiceGain: balance.voiceGain, pianoGain: balance.pianoGain, voiceCompression: 2, duckAmount: 0.25, channels: 1 }).channels[0];
	const afterRatioDb = amplitudeToDb(bandEnergy(after, 400) / bandEnergy(after, 110));
	console.log("voice/piano ratio before=" + beforeRatioDb.toFixed(1) + "dB after=" + afterRatioDb.toFixed(1) + "dB gains=" + balance.voiceGain.toFixed(2) + "/" + balance.pianoGain.toFixed(2));
	assert.ok(balance.voiceGain > 2, "voice must be boosted");
	assert.ok(afterRatioDb > beforeRatioDb + 12, "voice must move at least 12 dB closer/in front");
	assert.ok(afterRatioDb > -3, "voice must sit essentially level with or ahead of the piano");
	assert.ok(peakOf(after) <= 1, "no clipping beyond the hard ceiling");
	assert.ok(bandEnergy(after, 110) > 0.02, "piano remains audible");
});

test("silence is never amplified: a silent voice stem gets no boost and a warning", () => {
	const silent = [new Float32Array(8000)];
	const balance = autoBalanceStems({ voice: silent, piano });
	assert.equal(balance.voiceGain, 1);
	assert.ok(balance.warnings.includes("voice-too-quiet"));
	const mixed = mixStemChannels({ voice: silent, piano, voiceGain: balance.voiceGain, pianoGain: balance.pianoGain, channels: 1 }).channels[0];
	assert.ok(bandEnergy(mixed, 400) < 0.0001);
});

test("activity gating: voice present only in the second half is measured from its active part", () => {
	const half = new Float32Array(8000);
	half.set(sine(400, 4000, 0.05), 4000);
	const m = measureStem([half]);
	assert.ok(m.activeRms > 0.03 && m.activeRatio > 0.3 && m.activeRatio < 0.7);
});

test("ducking lowers the piano only while the voice is active", () => {
	const v = [new Float32Array(8000)];
	v[0].set(sine(400, 4000, 0.2), 0);
	const p = [sine(110, 8000, 0.5)];
	const ducked = mixStemChannels({ voice: v, piano: p, voiceGain: 0, pianoGain: 1, duckAmount: 0.6, channels: 1 }).channels[0];
	const rms = (arr) => Math.sqrt(arr.reduce((s, x) => s + x * x, 0) / arr.length);
	const duringVoice = rms(Array.from(ducked.slice(1000, 3000)));
	const afterVoice = rms(Array.from(ducked.slice(6000, 7900)));
	assert.ok(duringVoice < afterVoice * 0.85, "piano dips while singing");
});

test("exported WAV (real encoder) contains both stems at the balanced levels", () => {
	const balance = autoBalanceStems({ voice, piano });
	const stereoVoice = [voice[0], voice[0]];
	const stereoPiano = [piano[0], piano[0]];
	const mixed = mixStemChannels({ voice: stereoVoice, piano: stereoPiano, voiceGain: balance.voiceGain, pianoGain: balance.pianoGain, voiceCompression: 2, duckAmount: 0.25, channels: 2 });
	const bufferLike = { numberOfChannels: 2, length: mixed.length, sampleRate: SR, getChannelData: (c) => mixed.channels[c] };
	const wav = new DataView(encodeMultitrackWav(bufferLike, { bitsPerSample: 16 }));
	assert.equal(String.fromCharCode(...new Uint8Array(wav.buffer, 0, 4)), "RIFF");
	const samples = [];
	for (let i = 44; i + 1 < wav.byteLength; i += 4) samples.push(wav.getInt16(i, true) / 32768);
	const peak = peakOf(samples);
	assert.ok(peak > 0.15 && peak <= 1, "WAV has real level without clipping, peak=" + peak.toFixed(2));
	const left = Float32Array.from(samples);
	assert.ok(bandEnergy(left, 400) > 0.05, "voice present in WAV");
	assert.ok(bandEnergy(left, 110) > 0.02, "piano present in WAV");
	// Original stems are untouched by mixing/balancing.
	assert.ok(Math.abs(voice[0][100] - 0.03 * Math.sin(2 * Math.PI * 400 * 100 / SR)) < 1e-6);
});
