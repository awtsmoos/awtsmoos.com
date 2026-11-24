//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	FeedbackGuard,
	buildMicConstraints,
	canEnableMonitor,
	duckFactorFromDb,
	normalizeOutputMode,
	placeRecordedClip,
	resolveMonitorEnabled,
	totalLatencyCompensation
} from '../modules/recording/micSafety.js';
import { resolveMonitorEnabled as studioGate } from '../modules/workstation/song/multitrack/multitrackMicSafety.js';

test('one shared gate serves both surfaces: speakers make monitoring impossible', () => {
	assert.equal(studioGate, resolveMonitorEnabled);
	assert.equal(resolveMonitorEnabled(true, 'speakers'), false);
	assert.equal(resolveMonitorEnabled(true, 'headphones'), true);
	assert.equal(resolveMonitorEnabled(false, 'headphones'), false);
	assert.equal(canEnableMonitor('speakers'), false);
	assert.equal(normalizeOutputMode(undefined), 'speakers');
	assert.equal(normalizeOutputMode('headphones'), 'headphones');
});

test('mic constraints always carry echo cancellation and noise suppression', () => {
	for (const mode of ['speakers', 'headphones']) {
		const constraints = buildMicConstraints(mode);
		assert.equal(constraints.audio.echoCancellation, true);
		assert.equal(constraints.audio.noiseSuppression, true);
		assert.equal(constraints.audio.autoGainControl, true);
	}
	assert.equal(buildMicConstraints('speakers', { autoGainControl: false }).audio.autoGainControl, false);
});

test('latency compensation adds output and input paths', () => {
	assert.equal(totalLatencyCompensation({ outputLatency: 0.01, inputLatency: 0.005 }), 0.015);
	assert.equal(totalLatencyCompensation({ baseLatency: 0.003, inputLatency: 0.002 }), 0.005);
	assert.equal(totalLatencyCompensation({}), 0);
	assert.ok(Math.abs(duckFactorFromDb(-6) - 0.5012) < 0.001);
});

test('clip placement shifts earlier by compensation and trims at zero', () => {
	const placed = placeRecordedClip({
		transportStart: 4, captureStartContextTime: 100, playbackStartContextTime: 100,
		capturedDuration: 2, outputLatency: 0.02, inputLatency: 0.01
	});
	assert.ok(Math.abs(placed.timelineStart - 3.97) < 1e-9);
	assert.equal(placed.sourceOffset, 0);
	assert.equal(placed.duration, 2);
	const early = placeRecordedClip({
		transportStart: 0.01, captureStartContextTime: 50, playbackStartContextTime: 50,
		capturedDuration: 1, outputLatency: 0.03, inputLatency: 0.02
	});
	assert.equal(early.timelineStart, 0);
	assert.ok(Math.abs(early.sourceOffset - 0.04) < 1e-9);
	assert.ok(Math.abs(early.duration - 0.96) < 1e-9);
	const preroll = placeRecordedClip({
		transportStart: 2, captureStartContextTime: 10, playbackStartContextTime: 10.25,
		capturedDuration: 1
	});
	assert.ok(Math.abs(preroll.timelineStart - 1.75) < 1e-9);
});

test('feedback guard cuts the monitor on sustained near-clipping energy', () => {
	const guard = new FeedbackGuard();
	assert.equal(guard.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 0 }), 'ok');
	assert.equal(guard.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 200 }), 'ok');
	assert.equal(guard.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 300 }), 'cut');
	assert.equal(guard.feed({ rms: 0, peak: 0, monitoring: true, nowMs: 400 }), 'cut');
	guard.reset();
	assert.equal(guard.feed({ rms: 0, peak: 0, monitoring: true, nowMs: 500 }), 'ok');
});

test('feedback guard never fires on singing levels or while monitoring is off', () => {
	const guard = new FeedbackGuard();
	for (let t = 0; t <= 2000; t += 50) {
		const singing = { rms: 0.3 + 0.1 * Math.sin(t / 90), peak: 0.7, monitoring: true, nowMs: t };
		assert.equal(guard.feed(singing), 'ok');
	}
	const offGuard = new FeedbackGuard();
	for (let t = 0; t <= 2000; t += 50)
		assert.equal(offGuard.feed({ rms: 0.95, peak: 1, monitoring: false, nowMs: t }), 'ok');
	// Brief loud peaks that breathe (danger gaps reset the window) do not cut.
	const breathy = new FeedbackGuard();
	assert.equal(breathy.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 0 }), 'ok');
	assert.equal(breathy.feed({ rms: 0.2, peak: 0.4, monitoring: true, nowMs: 150 }), 'ok');
	assert.equal(breathy.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 200 }), 'ok');
	assert.equal(breathy.feed({ rms: 0.9, peak: 0.99, monitoring: true, nowMs: 450 }), 'ok');
});
