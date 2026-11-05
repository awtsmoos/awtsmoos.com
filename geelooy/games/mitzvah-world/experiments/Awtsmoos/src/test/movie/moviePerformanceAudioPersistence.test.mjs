// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceAudioPersistence.test.mjs
 * @description Proves microphone data, waveform, media, timeline linkage, reload, and mute/solo resolution.
 * The Awtsmoos lets voice receive a finite durable vessel without becoming required for motion;
 * Awtsmoos.com keeps Blob, data URL, waveform, latency, take, clip, track, and reload in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareMoviePerformanceAudioAsset } from '../../movie/MoviePerformanceAudioAsset.js';
import { attachMoviePerformanceAudio } from '../../movie/MoviePerformanceAudioProject.js';
import { resolveMovieRecordedAudio } from '../../movie/MovieRecordedAudioResolver.js';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import { addMoviePerformanceTake } from '../../movie/MoviePerformanceTakeCommands.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('microphone Blob becomes bounded data URL, duration, and waveform', async () => {
	const blob = new Blob([new Uint8Array([1, 2, 3, 4])], {
		type: 'audio/webm'
	});
	const asset = await prepareMoviePerformanceAudioAsset({
		blob,
		latencyMs: 42,
		mimeType: 'audio/webm'
	}, audioEnvironment());
	assert.match(asset.dataUrl, /^data:audio\/webm;base64,/);
	assert.equal(asset.duration, 1);
	assert.equal(asset.latencyMs, 42);
	assert.ok(asset.waveform.length >= 32);
	assert.ok(asset.waveform.length <= 512);
});


test('audio attachment survives normalization and links take, media, track, and clip', () => {
	let project = addMoviePerformanceTake(
		performanceProject(),
		performanceTake()
	);
	project = attachMoviePerformanceAudio(
		project,
		['take-one'],
		{
			dataUrl: 'data:audio/webm;base64,AQID',
			duration: 2,
			latencyMs: 50,
			mimeType: 'audio/webm',
			size: 3,
			warning: null,
			waveform: [0.1, 0.5, 0.2]
		},
		{
			characterId: 'player',
			start: 3
		}
	);
	const normalized = normalizeMovieProject(project);
	assert.doesNotThrow(() => validateMovieProject(normalized));
	const audioTrack = normalized.tracks.find(track => track.type === 'audio');
	const clip = audioTrack.clips[0];
	assert.equal(normalized.performance.takes[0].audioClipId, clip.id);
	assert.equal(normalized.media[0].url, 'data:audio/webm;base64,AQID');
	assert.deepEqual(normalized.media[0].metadata.waveform, [0.1, 0.5, 0.2]);
	assert.equal(clip.offset, 0.05);
	assert.equal(resolveMovieRecordedAudio(normalized, 3.5).length, 1);
	audioTrack.muted = true;
	assert.equal(resolveMovieRecordedAudio(normalized, 3.5).length, 0);
});

function audioEnvironment() {
	return {
		AudioContext: class {
			async close() {}
			async decodeAudioData() {
				return {
					duration: 1,
					getChannelData() {
						return new Float32Array(320).map((unused, index) => (
							Math.sin(index / 10) * 0.5
						));
					}
				};
			}
		},
		btoa(value) {
			return Buffer.from(value, 'binary').toString('base64');
		}
	};
}
