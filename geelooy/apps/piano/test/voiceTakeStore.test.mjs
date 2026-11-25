//B"H
/** Voice takes persist whole: both stems, the balance and the polish survive a reload. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MultitrackAssetStore, createMemoryAssetBackend } from '../modules/workstation/song/multitrack/multitrackAssetStore.js';
import { saveVoiceTake, restoreVoiceTakes, deleteVoiceTake, updateVoiceTakeBalance, readTakeManifest } from '../modules/recording/voiceTakeStore.js';

function fakeContext() {
	return {
		createBuffer: (channels, length, rate) => ({
			numberOfChannels: channels, length, sampleRate: rate, duration: length / rate,
			data: Array.from({ length: channels }, () => new Float32Array(length)),
			getChannelData(c) { return this.data[c]; }
		})
	};
}
function fakeBuffer(context, seed, channels = 1, length = 8) {
	const buffer = context.createBuffer(channels, length, 44100);
	for (let c = 0; c < channels; c++)
		for (let i = 0; i < length; i++) buffer.getChannelData(c)[i] = seed + c + i / 100;
	return buffer;
}
function fakeStorage() {
	const map = new Map();
	return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
}
function fakeTake(context, id = 1) {
	return {
		id, duration: 1.25, voiceGain: 1.1, pianoGain: 0.7, createdAt: 1234,
		voice: { buffer: fakeBuffer(context, 0.5, 1), startContextTime: 10 },
		piano: { buffer: fakeBuffer(context, -0.25, 2), startContextTime: 9.5 },
		polishedBuffer: fakeBuffer(context, 0.9, 2)
	};
}

test('save → restore returns stems, balance, polish and timing intact', async () => {
	const context = fakeContext();
	const store = new MultitrackAssetStore(createMemoryAssetBackend());
	const storage = fakeStorage();
	const take = fakeTake(context);
	await saveVoiceTake(take, { store, storage });
	assert.equal(readTakeManifest(storage).length, 1);
	const [restored] = await restoreVoiceTakes({ store, storage, context });
	assert.equal(restored.id, 1);
	assert.equal(restored.duration, 1.25);
	assert.equal(restored.voiceGain, 1.1);
	assert.equal(restored.pianoGain, 0.7);
	assert.equal(restored.voice.startContextTime, 10);
	assert.equal(restored.piano.startContextTime, 9.5);
	assert.deepEqual([...restored.voice.buffer.getChannelData(0)], [...take.voice.buffer.getChannelData(0)]);
	assert.deepEqual([...restored.piano.buffer.getChannelData(1)], [...take.piano.buffer.getChannelData(1)]);
	assert.deepEqual([...restored.polishedBuffer.getChannelData(0)], [...take.polishedBuffer.getChannelData(0)]);
});

test('identical stems dedupe; balance updates touch the manifest only; delete releases assets', async () => {
	const context = fakeContext();
	const store = new MultitrackAssetStore(createMemoryAssetBackend());
	const storage = fakeStorage();
	await saveVoiceTake(fakeTake(context, 1), { store, storage });
	await saveVoiceTake(fakeTake(context, 2), { store, storage }); // Same PCM content.
	assert.equal((await store.list()).length, 3); // voice + piano + polished, shared across takes.
	assert.equal(updateVoiceTakeBalance(2, 0.4, 1.3, storage), true);
	const [, second] = await restoreVoiceTakes({ store, storage, context });
	assert.equal(second.voiceGain, 0.4);
	assert.equal(second.pianoGain, 1.3);
	assert.equal(await deleteVoiceTake(1, { store, storage }), true);
	assert.equal((await store.list()).length, 3); // Refs still held by take 2.
	assert.equal(await deleteVoiceTake(2, { store, storage }), true);
	assert.equal((await store.list()).length, 0); // Last reference gone — assets collected.
	assert.deepEqual(await restoreVoiceTakes({ store, storage, context }), []);
});

test('re-saving a take replaces its assets without leaking references', async () => {
	const context = fakeContext();
	const store = new MultitrackAssetStore(createMemoryAssetBackend());
	const storage = fakeStorage();
	await saveVoiceTake(fakeTake(context, 1), { store, storage });
	const changed = fakeTake(context, 1);
	changed.voice = { buffer: fakeBuffer(context, 0.125, 1), startContextTime: 10 };
	await saveVoiceTake(changed, { store, storage });
	assert.equal(readTakeManifest(storage).length, 1);
	const [restored] = await restoreVoiceTakes({ store, storage, context });
	assert.deepEqual([...restored.voice.buffer.getChannelData(0)], [...changed.voice.buffer.getChannelData(0)]);
	await deleteVoiceTake(1, { store, storage });
	assert.equal((await store.list()).length, 0);
});
