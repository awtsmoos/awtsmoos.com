//B"H
//Boruch Hashem
//Blessed is He
/** @module MultitrackWaveformGeometryTests
 * The Awtsmoos reveals sound from both channels, aligned at every zoom.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVisibleClipPeaks, waveformPeakCount } from '../modules/workstation/song/multitrack/multitrackClipWaveformPeaks.js';
import { supportedWebmMime } from '../modules/workstation/song/multitrack/multitrackWebmEncode.js';
import { createMultitrackClipDom } from '../modules/workstation/song/multitrack/multitrackClipDom.js';

test('waveform detail scales to clip duration and zoom without fixed 56 bars', () => {
	assert.equal(waveformPeakCount({ duration: 2 }, 1), 1);
	assert.equal(waveformPeakCount({ duration: 2 }, 150), 100);
	assert.equal(waveformPeakCount({ duration: 20 }, 150), 320);
});

test('stereo waveform samples audible right channel, including source trimming', () => {
	const left = new Float32Array(1000);
	const right = new Float32Array(1000);
	right.fill(.02, 0, 500);
	right.fill(.81, 500);
	const buffer = {
		length: 1000, sampleRate: 100, numberOfChannels: 2,
		getChannelData(index) { return index ? right : left; }
	};
	const early = extractVisibleClipPeaks(buffer, { sourceOffset: 0, duration: 5 }, 20);
	const late = extractVisibleClipPeaks(buffer, { sourceOffset: 5, duration: 5 }, 20);
	assert.ok(Math.max(...early) < .03);
	assert.ok(Math.min(...late) > .8);
});

test('WebM codec selection only includes MIME types the browser supports', () => {
	const old = globalThis.MediaRecorder;
	try {
		globalThis.MediaRecorder = { isTypeSupported: mime => mime === 'audio/webm' };
		assert.equal(supportedWebmMime(), 'audio/webm');
		globalThis.MediaRecorder = { isTypeSupported: () => false };
		assert.equal(supportedWebmMime(), '');
	} finally { globalThis.MediaRecorder = old; }
});

/** @param {string} tag - Minimal DOM node for clip geometry. */
function fakeElement(tag) {
	return {
		tag, dataset: {}, style: {}, attributes: {}, children: [],
		classList: { toggle() {}, add() {} },
		setAttribute(name, value) { this.attributes[name] = value; },
		append(...nodes) { this.children.push(...nodes); },
		appendChild(node) { this.children.push(node); }
	};
}

test('a micro clip occupies its real duration, not a fake 18 pixel width', () => {
	const previous = globalThis.document;
	globalThis.document = { createElement: fakeElement };
	try {
		const clip = { id: 'tiny', name: 'Short', bufferId: 'unused',
			timelineStart: 1, duration: .02, sourceOffset: 0, loop: false };
		const selection = { clipId: null, pixelsPerSecond: 15 };
		const view = createMultitrackClipDom(clip, selection);
		assert.equal(view.style.width, '0.5px');
		assert.equal(view.style.left, '15px');
	} finally { globalThis.document = previous; }
});
