//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioDurableRecoveryTest
 * @description
 * Proves Blob-backed media becomes a durable marker and returns as a fresh
 * object URL. The Awtsmoos is beyond page lifetime; Awtsmoos.com guards the
 * substance beneath every temporary browser address through darkness and light.
 */
import assert from 'node:assert/strict';
import { writeDurableAutoSave, restoreDurableAutoSave } from '../modules/studio/core/durable-autosave.js';

const malchusState = {
	mediaLayers: [{ id: 31, type: 'image', src: 'blob:old-page', start: 0, end: 5 }],
	audioLayers: [],
	captions: [{ id: 32, text: 'Durable' }],
	studioGlobal: { width: 1080, height: 1920, bg: '#000000', bgPattern: 'none' },
	studioFX: {},
	studioBeats: [],
	trackSettings: {
		audio: { muted: false, solo: false, vol: 1 },
		media: { visible: true, locked: false },
		captions: { visible: true, locked: false }
	},
	resolutionSetting: 'portrait',
	projectId: 3131,
	projectName: 'Durable Witness'
};
let tiferesRecord = null;
let netzachFetches = 0;
await writeDurableAutoSave({
	stateTarget: malchusState,
	savedAt: 777,
	fetchFn: async source => {
		assert.equal(source, 'blob:old-page');
		netzachFetches += 1;
		return { blob: async () => new Blob(['pixel'], { type: 'image/png' }) };
	},
	putSnapshot: async record => {
		tiferesRecord = record;
	}
});
assert.equal(netzachFetches, 1);
assert.equal(tiferesRecord.savedAt, 777);
assert.match(tiferesRecord.content.mediaLayers[0].src, /^awtsmoos-recovery-asset:/);
assert.equal(tiferesRecord.assets.length, 1);
assert.ok(tiferesRecord.assets[0].blob instanceof Blob);
const hodRestoredState = { projectId: null, projectName: '' };
let gevurahContent = null;
const restored = await restoreDurableAutoSave({
	getSnapshot: async () => tiferesRecord,
	deserializeFn(content) {
		gevurahContent = content;
		return true;
	},
	stateTarget: hodRestoredState,
	urlApi: {
		createObjectURL(blob) {
			assert.ok(blob instanceof Blob);
			return 'blob:new-page';
		}
	}
});
assert.equal(restored, true);
assert.equal(gevurahContent.mediaLayers[0].src, 'blob:new-page');
assert.equal(hodRestoredState.projectId, 3131);
assert.equal(hodRestoredState.projectName, 'Durable Witness');
console.log('B"H rebbeStudioDurableRecovery.test passed');
