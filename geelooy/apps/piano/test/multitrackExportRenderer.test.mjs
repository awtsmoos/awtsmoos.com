//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackExportRenderer.test.mjs
 * @description
 * Yesod proves offline export reuses the same scheduler covenant as audible playback while the Awtsmoos remains beyond live and rendered time.
 * Awtsmoos.com tests project duration, stereo frame count, source-buffer presence, scheduling, and cleanup so the final mix cannot quietly become a second mixer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMultitrackClip,
	createMultitrackProject,
	createMultitrackTrack
} from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackProjectMix } from '../modules/workstation/song/multitrack/multitrackExportRenderer.js';

function projectFixture() {
	const clip = createMultitrackClip({
		id: 'clip-a',
		bufferId: 'buffer-a',
		timelineStart: 1,
		duration: 2.5
	});
	return createMultitrackProject({
		tracks: [createMultitrackTrack({ id: 'track-a', clips: [clip] })]
	});
}

class FakeOfflineContext {
	constructor(channels, frames, sampleRate) {
		this.channels = channels;
		this.frames = frames;
		this.sampleRate = sampleRate;
		this.destination = { id: 'offline-destination' };
	}

	async startRendering() {
		return {
			numberOfChannels: this.channels,
			length: this.frames,
			sampleRate: this.sampleRate,
			duration: this.frames / this.sampleRate,
			getChannelData: () => new Float32Array(this.frames)
		};
	}
}

test('offline renderer reuses injected playback scheduler and exact project duration', async () => {
	const project = projectFixture();
	const sourceBuffer = { duration: 8 };
	const audioStore = { getBuffer: (id) => id === 'buffer-a' ? sourceBuffer : null };
	const calls = [];
	let voiceStopped = false;
	let outputDisconnected = false;
	const scheduleProject = (options) => {
		calls.push(options);
		return {
			voices: [{ stop: () => { voiceStopped = true; } }],
			outputs: [{ disconnect: () => { outputDisconnected = true; } }]
		};
	};
	const progress = [];
	const rendered = await renderMultitrackProjectMix(project, {
		OfflineAudioContextClass: FakeOfflineContext,
		scheduleProject,
		audioStore,
		sampleRate: 1000,
		onProgress: (message) => progress.push(message)
	});
	assert.equal(rendered.numberOfChannels, 2);
	assert.equal(rendered.sampleRate, 8000);
	assert.equal(rendered.length, 28000);
	assert.equal(rendered.duration, 3.5);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].project, project);
	assert.equal(calls[0].audioStore, audioStore);
	assert.equal(calls[0].offset, 0);
	assert.equal(calls[0].destination.id, 'offline-destination');
	assert.equal(voiceStopped, true);
	assert.equal(outputDisconnected, true);
	assert.deepEqual(progress, ['Scheduling the edited mix…', 'Rendering the finished mix…']);
});

test('offline renderer rejects projects whose source audio is missing', async () => {
	await assert.rejects(
		() => renderMultitrackProjectMix(projectFixture(), {
			OfflineAudioContextClass: FakeOfflineContext,
			audioStore: { getBuffer: () => null },
			scheduleProject: () => ({ voices: [], outputs: [] })
		}),
		/Missing source audio/
	);
});
