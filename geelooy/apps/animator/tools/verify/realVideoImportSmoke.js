// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { ObjectUrlRegistry } from '../../src/nle/media/ObjectUrlRegistry.js';
import { VideoImportService } from '../../src/nle/media/VideoImportService.js';
import { MediaAssetRepository } from '../../src/nle/persistence/MediaAssetRepository.js';
import { MemoryPersistenceGateway } from '../../src/nle/persistence/MemoryPersistenceGateway.js';

/**
 * The Awtsmoos renews imported pixels across two simulated page lives. This
 * smoke test proves that Awtsmoos.com persists real video, activates the video
 * track, preserves compositing controls, and restores a new playable URL.
 */
function createStore() {
	return new NLEStore({
		duration: 120000,
		mediaAssets: [
			{ id: 'real_video_plate', type: 'video', enabled: false, source: null }
		],
		clips: [
			{
				id: 'video_plate_contract',
				trackId: 'track_video',
				start: 0,
				duration: 120000,
				type: 'video',
				transform: { x: 8, y: 4, scale: 0.9, rotation: 2, opacity: 0.6 },
				payload: { enabled: false, blendMode: 'screen', opacity: 0.6 }
			}
		]
	});
}

function createUrlApi(prefix) {
	let serial = 0;
	return {
		createObjectURL() {
			serial += 1;
			return `blob://${prefix}-${serial}`;
		},
		revokeObjectURL() {}
	};
}

const file = new Blob(['video-bytes'], { type: 'video/mp4' });
Object.defineProperties(file, {
	name: { value: 'original-family-scene.mp4' },
	lastModified: { value: 1783950000000 }
});
const gateway = new MemoryPersistenceGateway();
const repository = new MediaAssetRepository(
	gateway,
	() => '2026-07-13T14:00:00.000Z'
);
const probe = {
	measure: async () => ({ durationMs: 18000, width: 1920, height: 1080 })
};
const firstStore = createStore();
const firstService = new VideoImportService({
	repository,
	probe,
	urlRegistry: new ObjectUrlRegistry(createUrlApi('first'))
});
const asset = await firstService.importFile(firstStore, file);
const importedClip = firstStore.get().clips.find((clip) => {
	return clip.id === 'video_plate_contract';
});
assert.equal(importedClip.payload.enabled, true);
assert.equal(importedClip.payload.assetId, asset.id);
assert.equal(importedClip.payload.blendMode, 'screen');
assert.equal(importedClip.transform.scale, 0.9);
assert.equal(firstStore.get().videoImportStatus, 'ready');
assert.equal((await repository.findAll()).length, 1);

const restoredStore = createStore();
const restoredService = new VideoImportService({
	repository,
	probe,
	urlRegistry: new ObjectUrlRegistry(createUrlApi('restored'))
});
await restoredService.restore(restoredStore);
const restoredClip = restoredStore.get().clips.find((clip) => {
	return clip.id === 'video_plate_contract';
});
assert.equal(restoredClip.payload.sourceUrl.startsWith('blob://restored-'), true);
assert.equal(restoredStore.get().mediaAssets.at(-1).width, 1920);
await assert.rejects(
	() => restoredService.importFile(
		restoredStore,
		new Blob(['text'], { type: 'text/plain' })
	),
	/Only video files/
);
console.log('B"H - real video import smoke passed.');
