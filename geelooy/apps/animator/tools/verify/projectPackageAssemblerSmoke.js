// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { DialogueRecordingRepository } from '../../src/nle/persistence/DialogueRecordingRepository.js';
import { MediaAssetRepository } from '../../src/nle/persistence/MediaAssetRepository.js';
import { MemoryPersistenceGateway } from '../../src/nle/persistence/MemoryPersistenceGateway.js';
import { ProjectPackageAssembler } from '../../src/nle/project/ProjectPackageAssembler.js';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';

/**
 * Browser-persisted bytes become pure portable data in this smoke. The Awtsmoos
 * renews Blob and manifest; Awtsmoos.com proves that no temporary URL or living
 * Blob leaks into serialized project truth.
 */
const plan = TwoMinuteStrategyMovie.create('package-assembler-smoke');
const gateway = new MemoryPersistenceGateway();
const recordings = new DialogueRecordingRepository(gateway, () => '2026-07-13T15:00:00.000Z');
const media = new MediaAssetRepository(gateway, () => '2026-07-13T15:00:00.000Z');
const dialogueClip = plan.nle.clips.find((clip) => clip.type === 'dialogue');
const videoClip = plan.nle.clips.find((clip) => clip.type === 'video');
const videoBlob = new Blob(['real-video-bytes'], { type: 'video/mp4' });
const audioBlob = new Blob(['recorded-voice-bytes'], { type: 'audio/wav' });
await recordings.save({ clipId: dialogueClip.id, blob: audioBlob, durationMs: 1200 });
await media.save({
	id: 'asset_package_smoke',
	blob: videoBlob,
	mimeType: 'video/mp4',
	durationMs: 2400,
	width: 640,
	height: 360
});
const clips = plan.nle.clips.map((clip) => {
	if (clip.id !== videoClip.id) return clip;
	return {
		...clip,
		payload: {
			...clip.payload,
			assetId: 'asset_package_smoke',
			enabled: true,
			sourceUrl: 'blob://must-not-survive'
		}
	};
});
const store = new NLEStore({
	duration: plan.duration,
	tracks: plan.nle.tracks,
	clips,
	mediaAssets: []
});
const assembler = new ProjectPackageAssembler({
	moviePlan: plan,
	recordingRepository: recordings,
	mediaRepository: media,
	clock: () => '2026-07-13T15:00:00.000Z'
});
const projectPackage = await assembler.assemble(store);
const serialized = JSON.stringify(projectPackage.manifest);
assert.equal(projectPackage.manifest.media.length, 2);
assert.equal(projectPackage.files.length, 2);
assert.equal(serialized.includes('blob://'), false);
assert.equal(serialized.includes('audioUrl'), false);
assert.equal(serialized.includes('"blob"'), false);
assert.ok(projectPackage.manifest.media.every((item) => item.sha256.length === 64));
console.log('B"H - project package assembler smoke passed.');
