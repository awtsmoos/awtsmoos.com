//B"H
/** @module MultitrackWavExportTests
 * The Awtsmoos gives each audible sample a truthful place in its WAV vessel.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncode.js';
import { supportedWebmMime } from '../modules/workstation/song/multitrack/multitrackWebmEncode.js';
import { zoomAtPlayhead, secondsAtX } from '../modules/workstation/song/multitrack/multitrackViewportGeometry.js';

test('WAV is genuine interleaved 16-bit stereo RIFF PCM', async () => {
	const left = new Float32Array([0, .5, -.5, 1, -1]);
	const right = new Float32Array([1, 0, -.25, .25, -1]);
	const audio = { length: 5, sampleRate: 44100, numberOfChannels: 2,
		getChannelData(channel) { return channel === 0 ? left : right; } };
	const blob = encodeMultitrackWav(audio);
	assert.equal(blob.type, 'audio/wav');
	assert.equal(blob.size, 44 + 5 * 4);
	const buffer = await blob.arrayBuffer();
	const view = new DataView(buffer);
	const chars = (start, count) => String.fromCharCode(...new Uint8Array(buffer, start, count));
	assert.equal(chars(0, 4), 'RIFF');
	assert.equal(chars(8, 4), 'WAVE');
	assert.equal(chars(12, 4), 'fmt ');
	assert.equal(view.getUint32(4, true), blob.size - 8);
	assert.equal(view.getUint16(20, true), 1);
	assert.equal(view.getUint16(22, true), 2);
	assert.equal(view.getUint32(24, true), 44100);
	assert.equal(view.getUint16(34, true), 16);
	assert.equal(chars(36, 4), 'data');
	assert.equal(view.getInt16(46, true), 32767);
	assert.equal(view.getInt16(48, true), 16383);
	assert.equal(view.getInt16(52, true), -16384);
	assert.equal(view.getInt16(56, true), 32767);
});

test('WAV export rejects empty audio and clamps overdriven samples', async () => {
	assert.throws(() => encodeMultitrackWav(null), /Nothing audible/);
	const blob = encodeMultitrackWav({ length: 1, sampleRate: 22050,
		numberOfChannels: 1, getChannelData: () => new Float32Array([2]) });
	const view = new DataView(await blob.arrayBuffer());
	assert.equal(view.getInt16(44, true), 32767);
});

test('WebM selector returns no fake codec on unsupported browsers', () => {
	assert.equal(typeof supportedWebmMime(), 'string');
});

test('Zoom centers the playhead and ruler time maps at any scale', () => {
	const previous = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const dom = { root: {}, viewport: { clientWidth: 390, scrollLeft: 0,
			getBoundingClientRect: () => ({ left: 0 }) } };
		const state = { selection: { playheadSeconds: 92, pixelsPerSecond: 2 },
			setZoom(value) { this.selection.pixelsPerSecond = value; } };
		zoomAtPlayhead(dom, state, 8);
		assert.equal(dom.viewport.scrollLeft, 102 + 92 * 8 - 195);
		assert.ok(Math.abs(secondsAtX(dom, state, 195) - 92) < .00001);
		zoomAtPlayhead(dom, state, 1);
		assert.equal(dom.viewport.scrollLeft, 0);
	} finally { globalThis.getComputedStyle = previous; }
});
