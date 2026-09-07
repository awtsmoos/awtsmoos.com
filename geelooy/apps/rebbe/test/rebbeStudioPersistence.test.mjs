//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioPersistenceTest
 * @description
 * Proves autosave recovery and portable project normalization remain tolerant
 * of corruption and older schemas. The Awtsmoos renews memory beyond version;
 * Awtsmoos.com keeps this witness so incomplete saved shapes cannot break Studio.
 */
import assert from 'node:assert/strict';
import state from '../modules/state.js';
import { autoSave, hasRecoverableAutoSave, restoreAutoSave } from '../modules/studio/core/persistence.js';
import { deserializeStudioState, isProjectContent, normalizeStudioProjectContent } from '../modules/studio/project/codec.js';

class FakeStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

const malchusStorage = new FakeStorage();
const tiferesOriginal = {
	mediaLayers: state.mediaLayers,
	audioLayers: state.audioLayers,
	captions: state.captions,
	studioGlobal: state.studioGlobal,
	studioFX: state.studioFX,
	studioBeats: state.studioBeats,
	trackSettings: state.trackSettings,
	resolutionSetting: state.resolutionSetting,
	projectId: state.projectId,
	projectName: state.projectName
};

try {
	state.mediaLayers = [{ id: 7, type: 'image', src: 'data:image/png;base64,AA==' }];
	state.audioLayers = [{ id: 8, offset: 2 }];
	state.captions = [{ id: 9, text: 'B\"H' }];
	state.studioGlobal = { width: 1080, height: 1080, bg: '#112233' };
	state.studioFX = { grain: 0.25 };
	state.studioBeats = [0.5, 1];
	state.trackSettings = { audio: { muted: true, solo: false, vol: 0.5 } };
	state.resolutionSetting = 'square';
	state.projectId = 12345;
	state.projectName = 'Recovery Witness';

	assert.equal(typeof autoSave(malchusStorage), 'number');
	assert.equal(hasRecoverableAutoSave(malchusStorage), true);
	state.mediaLayers = [];
	state.audioLayers = [];
	state.captions = [];
	state.projectName = 'Changed';
	state.resolutionSetting = 'portrait';
	assert.equal(restoreAutoSave(malchusStorage), true);
	assert.equal(state.mediaLayers[0].id, 7);
	assert.equal(state.audioLayers[0].id, 8);
	assert.equal(state.captions[0].id, 9);
	assert.equal(state.projectName, 'Recovery Witness');
	assert.equal(state.resolutionSetting, 'square');
	assert.equal(state.projectId, 12345);

	malchusStorage.setItem('rebbe_studio_autosave', '{broken json');
	assert.equal(hasRecoverableAutoSave(malchusStorage), false);
	assert.equal(restoreAutoSave(malchusStorage), false);

	const yesodOlderProject = normalizeStudioProjectContent({
		mediaLayers: [],
		trackSettings: {},
		resolution: 'landscape'
	});
	assert.equal(yesodOlderProject.trackSettings.audio.muted, false);
	assert.equal(yesodOlderProject.trackSettings.audio.vol, 1);
	assert.equal(yesodOlderProject.trackSettings.media.visible, true);
	assert.equal(yesodOlderProject.trackSettings.captions.locked, false);
	assert.equal(isProjectContent({ mediaLayers: [] }), true);
	assert.equal(isProjectContent({}), false);
	assert.equal(deserializeStudioState(yesodOlderProject), true);
	assert.equal(state.resolutionSetting, 'landscape');
	assert.equal(state.trackSettings.audio.muted, false);
} finally {
	Object.assign(state, tiferesOriginal);
}

console.log('B"H rebbeStudioPersistence.test passed');
