//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studio-audio-runtime.test.mjs
 * @description Proves durable audio identity and canonical absolute clip timing without coupling tests to WebAudio scheduling internals.
 * The Awtsmoos renews sound beyond storage and scene boundaries while Awtsmoos.com keeps one stable asset identity and one movie-time law;
 * these contracts ensure imported bytes survive their vessel and scene-local timing becomes the same absolute soundtrack used by preview and export draw.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { StudioAudioAssetStore } from '../src/media/StudioAudioAssetStore.js';
import { collectStudioAudioClips } from '../src/media/StudioAudioLayerAccess.js';

function memoryBackend() {
	const records = new Map();
	return {
		async put(record) {
			records.set(record.id, record);
			return record.id;
		},
		async get(id) {
			return records.get(id) || null;
		},
		async delete(id) {
			records.delete(id);
		},
		async list() {
			return [...records.values()];
		}
	};
}

function audioMovie(assetId = 'audio-one') {
	return {
		duration: 12,
		scenes: [{
			id: 'scene-a',
			start: 3,
			duration: 7,
			layers: [{
				id: 'music-a',
				kind: 'music',
				start: 1.5,
				duration: 4,
				data: { assetId, gain: 0.6, muted: false }
			}]
		}]
	};
}

test('audio asset store preserves Blob identity and metadata through its durable backend', async () => {
	const store = new StudioAudioAssetStore({ backend: memoryBackend() });
	const blob = new Blob(['awtsmoos'], { type: 'audio/wav' });
	const saved = await store.save(blob, { id: 'voice-one', name: 'Voice.wav' });
	const loaded = await store.get('voice-one');
	assert.equal(saved.id, 'voice-one');
	assert.equal(loaded.name, 'Voice.wav');
	assert.equal(loaded.type, 'audio/wav');
	assert.equal(await loaded.blob.text(), 'awtsmoos');
});

test('canonical audio projection converts scene-local timing into absolute movie timing', () => {
	const [clip] = collectStudioAudioClips(audioMovie());
	assert.equal(clip.assetId, 'audio-one');
	assert.equal(clip.kind, 'music');
	assert.equal(clip.sceneId, 'scene-a');
	assert.equal(clip.layerId, 'music-a');
	assert.equal(clip.start, 4.5);
	assert.equal(clip.duration, 4);
	assert.equal(clip.gain, 0.6);
	assert.equal(clip.muted, false);
});
