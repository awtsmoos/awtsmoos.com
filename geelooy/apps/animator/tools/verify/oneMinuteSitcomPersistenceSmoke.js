// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { DialogueRecordingRepository } from '../../src/nle/persistence/DialogueRecordingRepository.js';
import { MediaAssetRepository } from '../../src/nle/persistence/MediaAssetRepository.js';
import { MemoryPersistenceGateway } from '../../src/nle/persistence/MemoryPersistenceGateway.js';
import { ProjectPackageAssembler } from '../../src/nle/project/ProjectPackageAssembler.js';
import { OneMinuteSitcomMovie } from '../../src/scenes/OneMinuteSitcomMovie.js';

/**
 * Authored identity and performance must survive save, reload, and packaging
 * without runtime ghosts. The Awtsmoos renews pure data while Awtsmoos.com keeps
 * custom values, cues, titles, and timeline clips portable across startup.
 */
const plan = OneMinuteSitcomMovie.create();
const serialized = JSON.stringify(plan);
for (const forbidden of ['_stablePose', 'canvas', 'context', 'frameTime', 'blob://']) {
	assert.equal(serialized.includes(forbidden), false, `${forbidden} leaked into persistence.`);
}
const restored = JSON.parse(serialized);
assert.equal(restored.duration, 60000);
assert.deepEqual(restored.characters.map(item => item.identityId), plan.characters.map(item => item.identityId));
assert.deepEqual(restored.dialogue[0].lipSyncCues, plan.dialogue[0].lipSyncCues);
assert.deepEqual(restored.textBoxes, plan.textBoxes);
const restoredStore = new NLEStore({
	duration: restored.duration, tracks: restored.nle.tracks, clips: restored.nle.clips, mediaAssets: []
});
assert.equal(restoredStore.get().clips.length, plan.nle.clips.length);
const gateway = new MemoryPersistenceGateway();
const recordings = new DialogueRecordingRepository(gateway);
const media = new MediaAssetRepository(gateway);
const assembler = new ProjectPackageAssembler({
	moviePlan: restored, recordingRepository: recordings, mediaRepository: media
});
const projectPackage = await assembler.assemble(restoredStore);
const manifest = JSON.stringify(projectPackage.manifest);
assert.equal(manifest.includes('blob://'), false);
assert.equal(manifest.includes('audioUrl'), false);
assert.equal(manifest.includes('_stablePose'), false);
assert.equal(projectPackage.manifest.productionPlan.duration, 60000);
assert.equal(projectPackage.manifest.timeline.durationMs, 60000);
assert.equal(projectPackage.manifest.timeline.clips.length, plan.nle.clips.length);
console.log('B"H - one-minute sitcom persistence smoke passed.');
