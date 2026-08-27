// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceAudioFailures.test.mjs
 * @description Proves microphone failure classification, track-listener cleanup, and playback-warning deduplication.
 * The Awtsmoos hides no silent failure and leaves no borrowed device behind; Awtsmoos.com
 * keeps permission, loss, recorder, promise warning, stream release, and console quiet in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceAudio } from '../../movie/MoviePerformanceAudio.js';
import { classifyMoviePerformanceAudioFailure } from '../../movie/MoviePerformanceAudioFailure.js';
import { MoviePerformanceRecorderMedia } from '../../movie/MoviePerformanceRecorderMedia.js';
import { MovieRecordedAudioWarnings } from '../../movie/MovieRecordedAudioWarnings.js';

test('permission and device failures produce machine-readable evidence', async () => {
	const events = [];
	const media = new MoviePerformanceRecorderMedia({
		cancel() {},
		async start() { throw new Error('NotAllowedError: Permission denied'); },
		async stop() { return null; }
	}, (name, detail) => events.push([name, detail]));
	const result = await media.start(true);
	assert.equal(result.enabled, false);
	assert.equal(result.failure.code, 'PERFORMANCE_AUDIO_PERMISSION_DENIED');
	assert.equal(events[0][0], 'performance:audio-permission-failure');
	assert.equal(classifyMoviePerformanceAudioFailure(
		'NotFoundError: no device',
		'start'
	).kind, 'no-device');
	assert.equal(classifyMoviePerformanceAudioFailure(
		'PERFORMANCE_AUDIO_DEVICE_LOST: track ended',
		'device'
	).kind, 'device-loss');
});

test('microphone cancellation removes ended listener before stopping track', async () => {
	const calls = [];
	const track = {
		addEventListener(name, handler) { calls.push(['add', name]); this.handler = handler; },
		removeEventListener(name, handler) {
			assert.equal(handler, this.handler);
			calls.push(['remove', name]);
		},
		stop() { calls.push(['stop']); }
	};
	class Recorder {
		constructor() { this.mimeType = 'audio/webm'; this.state = 'recording'; }
		start() { calls.push(['record']); }
		stop() { this.state = 'inactive'; calls.push(['recorder-stop']); }
	}
	const audio = new MoviePerformanceAudio({
		Blob,
		MediaRecorder: Recorder,
		navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [track] }) } },
		performance: { now: () => 10 }
	});
	await audio.start({ enabled: true });
	audio.cancel();
	assert.deepEqual(calls, [
		['add', 'ended'],
		['record'],
		['recorder-stop'],
		['remove', 'ended'],
		['stop']
	]);
});

test('playback promise warnings are deduplicated and reset on cleanup', async () => {
	const events = [];
	const warnings = new MovieRecordedAudioWarnings((name, detail) => (
		events.push([name, detail])
	));
	const audio = {
		dataset: { performanceAudioClip: 'audio-clip' },
		play: () => Promise.reject(new Error('Autoplay denied'))
	};
	warnings.play(audio);
	warnings.play(audio);
	await new Promise(resolve => setTimeout(resolve, 0));
	assert.equal(events.length, 1);
	warnings.clear();
	warnings.play(audio);
	await new Promise(resolve => setTimeout(resolve, 0));
	assert.equal(events.length, 2);
	assert.equal(events[0][1].clipId, 'audio-clip');
});
