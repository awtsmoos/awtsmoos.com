// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { DialogueRecordingSession } from '../../src/nle/audio/DialogueRecordingSession.js';
import { ObjectUrlRegistry } from '../../src/nle/media/ObjectUrlRegistry.js';
import { DialogueRecordingRepository } from '../../src/nle/persistence/DialogueRecordingRepository.js';
import { MemoryPersistenceGateway } from '../../src/nle/persistence/MemoryPersistenceGateway.js';
import {
	DialoguePersistenceFixture,
	FakeDialogueMicrophone
} from './fixtures/DialoguePersistenceFixture.js';

/**
 * The Awtsmoos renews a voice across two simulated page lives. This smoke test
 * proves Awtsmoos.com saves, restores, retimes, rebinds, and explicitly clears
 * a recorded performance without trusting a temporary object URL.
 */
function createSession(repository) {
	const urlApi = DialoguePersistenceFixture.createUrlApi();
	return new DialogueRecordingSession({
		microphone: new FakeDialogueMicrophone(),
		repository,
		durationProbe: { measure: async () => 3400 },
		urlApi,
		urlRegistry: new ObjectUrlRegistry(urlApi)
	});
}

const gateway = new MemoryPersistenceGateway();
const repository = new DialogueRecordingRepository(
	gateway,
	() => '2026-07-13T14:00:00.000Z'
);
const firstStore = DialoguePersistenceFixture.createStore();
const firstSession = createSession(repository);

await firstSession.start(firstStore, 'dialogue_d1');
await firstSession.stop(firstStore);
const saved = await repository.findByClipId('dialogue_d1');
const firstClips = firstStore.get().clips;
assert.equal(saved.durationMs, 3400);
assert.equal(firstClips.find((clip) => clip.id === 'bubble_d1').duration, 3400);
assert.equal(firstClips.find((clip) => clip.id === 'action_after').start, 3900);

const restoredStore = DialoguePersistenceFixture.createStore();
const restoredSession = createSession(repository);
await restoredSession.restore(restoredStore);
const restoredClip = restoredStore.get().clips.find((clip) => {
	return clip.id === 'dialogue_d1';
});
assert.equal(restoredClip.payload.voiceStatus, 'ready');
assert.equal(restoredClip.payload.audioUrl.startsWith('blob://recording-'), true);
assert.equal(restoredClip.duration, 3400);

await restoredSession.clear(restoredStore, 'dialogue_d1');
const clearedClip = restoredStore.get().clips.find((clip) => {
	return clip.id === 'dialogue_d1';
});
assert.equal(await repository.findByClipId('dialogue_d1'), null);
assert.equal(clearedClip.payload.voiceStatus, 'empty');
console.log('B"H - dialogue recording persistence smoke passed.');
