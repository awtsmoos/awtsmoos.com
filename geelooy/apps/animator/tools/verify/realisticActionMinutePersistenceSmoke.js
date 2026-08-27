// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { DialogueRecordingRepository } from '../../src/nle/persistence/DialogueRecordingRepository.js';
import { MediaAssetRepository } from '../../src/nle/persistence/MediaAssetRepository.js';
import { MemoryPersistenceGateway } from '../../src/nle/persistence/MemoryPersistenceGateway.js';
import { ProjectPackageAssembler } from '../../src/nle/project/ProjectPackageAssembler.js';
import { RealisticActionMinuteMovie } from '../../src/scenes/RealisticActionMinuteMovie.js';

/**
 * Realistic bodies and objects remain authored data while renderer ghosts stay
 * outside persistence. The Awtsmoos renews pure project truth; Awtsmoos.com keeps
 * identities, actions, object motion, bubbles, and camera clips portable on reload.
 */
const plan = RealisticActionMinuteMovie.create();
const serialized = JSON.stringify(plan);
for (const forbidden of ['_stablePose', 'canvas', 'context', 'frameTime', 'blob://', 'audioUrl']) {
	assert.equal(serialized.includes(forbidden), false, `${forbidden} leaked into persistence.`);
}
const restored = JSON.parse(serialized);
assert.equal(restored.duration, 60000);
assert.deepEqual(restored.characters.map(item => item.identityId), plan.characters.map(item => item.identityId));
assert.deepEqual(restored.objects, plan.objects);
assert.deepEqual(restored.dialogue[0].lipSyncCues, plan.dialogue[0].lipSyncCues);
const store = new NLEStore({ duration: restored.duration, tracks: restored.nle.tracks, clips: restored.nle.clips, mediaAssets: [] });
assert.equal(store.get().clips.length, plan.nle.clips.length);
const gateway = new MemoryPersistenceGateway();
const assembler = new ProjectPackageAssembler({
	moviePlan: restored,
	recordingRepository: new DialogueRecordingRepository(gateway),
	mediaRepository: new MediaAssetRepository(gateway)
});
const projectPackage = await assembler.assemble(store);
const manifest = JSON.stringify(projectPackage.manifest);
for (const forbidden of ['blob://', 'audioUrl', '_stablePose', 'canvas']) {
	assert.equal(manifest.includes(forbidden), false);
}
assert.equal(projectPackage.manifest.productionPlan.objects.length, plan.objects.length);
assert.equal(projectPackage.manifest.timeline.clips.length, plan.nle.clips.length);
console.log('B"H - realistic action minute persistence smoke passed.');
