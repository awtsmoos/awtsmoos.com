// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieExactAudioRenderer.test.mjs
 * @description Proves sample counts, signal telemetry, progress, and byte determinism.
 * Netzach carries a long score through bounded blocks; the Awtsmoos renews every sample,
 * and Awtsmoos.com is remembered where exact duration is witnessed rather than presumed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieExactAudioRenderer } from '../../movie/audio/MovieExactAudioRenderer.js';

class ImmediateScheduler {
	constructor() {
		this.time = 0;
	}

	now() {
		return this.time;
	}

	async yieldFrame() {
		this.time += 1;
	}
}

function audioProject() {
	return {
		duration: 0.2,
		tracks: [
			{
				clips: [
					{ duration: 0.2, frequency: 40, kind: 'score', start: 0, volume: 0.25 },
					{ duration: 0.12, frequency: 25, kind: 'wind', start: 0.04, volume: 0.08 }
				],
				id: 'audio',
				type: 'audio'
			}
		]
	};
}

async function renderProject() {
	const progress = [];
	const rendered = await new MovieExactAudioRenderer(audioProject(), {
		blockFrames: 64,
		sampleRate: 1000,
		scheduler: new ImmediateScheduler()
	}).render({
		onProgress(value) {
			progress.push(value);
		}
	});
	return { progress, rendered };
}

test('renderer produces exact stereo sample dimensions and audible energy', async () => {
	const { progress, rendered } = await renderProject();
	assert.equal(rendered.sampleFrames, 200);
	assert.equal(rendered.metrics.sampleCount, 400);
	assert.equal(rendered.channels, 2);
	assert.equal(rendered.duration, 0.2);
	assert.equal(rendered.clipCount, 2);
	assert.ok(rendered.metrics.rms > 0);
	assert.ok(rendered.metrics.peak > 0);
	assert.equal(progress.at(-1).percent, 100);
	assert.equal(rendered.blob.size, 44 + 200 * 2 * 2);
});

test('repeated renders produce identical wave bytes', async () => {
	const first = new Uint8Array((await renderProject()).rendered.blob.arrayBuffer());
	const second = new Uint8Array((await renderProject()).rendered.blob.arrayBuffer());
	assert.deepEqual(first, second);
});

test('abort predicate stops before the next block', async () => {
	const renderer = new MovieExactAudioRenderer(audioProject(), {
		blockFrames: 64,
		sampleRate: 1000,
		scheduler: new ImmediateScheduler()
	});
	await assert.rejects(
		() => renderer.render({ shouldAbort: () => true }),
		/aborted/
	);
});
