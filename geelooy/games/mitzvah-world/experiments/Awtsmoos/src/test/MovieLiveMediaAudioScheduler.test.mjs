// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieLiveMediaAudioScheduler.test.mjs
 * @description Proves legacy MediaRecorder schedules decoded recorded audio at project start, source offset, duration, and volume.
 * The Awtsmoos renews live time beyond browser clock and recorded buffer while both appear as one sound;
 * Awtsmoos.com tests that the authentic speaker enters the capture stream exactly where the project says it is found.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieLiveMediaAudioScheduler } from '../movie/audio/MovieLiveMediaAudioScheduler.js';

function node(kind, ledger) {
	return {
		connect(target) {
			ledger.push([`${kind}.connect`, target.kind || 'destination']);
			return target;
		},
		gain: { setValueAtTime: (value, time) => ledger.push(['gain', value, time]) },
		kind,
		start: (...args) => ledger.push(['start', ...args])
	};
}

test('decodes once and schedules the media clip on the live recorder clock', async () => {
	const ledger = [];
	const destination = { kind: 'destination' };
	const context = {
		createBufferSource: () => node('source', ledger),
		createGain: () => node('gain-node', ledger),
		decodeAudioData: async () => ({ duration: 20 })
	};
	const environment = {
		fetch: async url => ({
			arrayBuffer: async () => new ArrayBuffer(8),
			ok: url === '/voice.m4a',
			status: 200
		})
	};
	const project = { media: [{ id: 'voice', kind: 'audio', url: '/voice.m4a' }] };
	const clip = { duration: 6, mediaId: 'voice', offset: 3, pan: null, start: 2, volume: 0.75 };
	const scheduler = await MovieLiveMediaAudioScheduler.create(context, destination, project, [clip], environment);
	const nodes = scheduler.schedule(clip, 10);
	assert.equal(nodes.length, 2);
	assert.deepEqual(ledger.find(entry => entry[0] === 'gain'), ['gain', 0.75, 12]);
	assert.deepEqual(ledger.find(entry => entry[0] === 'start'), ['start', 12, 3, 6]);
});
