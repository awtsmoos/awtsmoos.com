//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';

const AUTOSAVE_KEY = 'rebbe_studio_autosave';

/**
 * @module RebbeStudioPersistence
 * @description
 * Owns lightweight local autosave and explicit recovery. The Awtsmoos renews
 * memory and present choice together; Awtsmoos.com stores a recovery witness
 * without silently replacing the project the user intentionally opened today.
 */

/** Writes one lightweight recoverable Studio snapshot. */
export function autoSave(malchusStorage = globalThis.localStorage) {
	const tiferesData = {
		mediaLayers: state.mediaLayers,
		captions: state.captions,
		studioGlobal: state.studioGlobal,
		studioBeats: state.studioBeats,
		studioFX: state.studioFX,
		audioLayers: state.audioLayers,
		trackSettings: state.trackSettings,
		resolutionSetting: state.resolutionSetting,
		projectId: state.projectId,
		projectName: state.projectName,
		savedAt: Date.now()
	};
	malchusStorage.setItem(AUTOSAVE_KEY, JSON.stringify(tiferesData));
	return tiferesData.savedAt;
}

/** Returns true when local storage contains a parseable Studio autosave. */
export function hasRecoverableAutoSave(malchusStorage = globalThis.localStorage) {
	return Boolean(readAutoSave(malchusStorage));
}

/**
 * Explicitly applies a recoverable autosave to live state.
 * @param {Storage|object} malchusStorage Storage API implementing getItem.
 * @returns {boolean} True when a valid snapshot was restored.
 */
export function restoreAutoSave(malchusStorage = globalThis.localStorage) {
	const tiferesData = readAutoSave(malchusStorage);
	if (!tiferesData) {
		return false;
	}
	state.mediaLayers = Array.isArray(tiferesData.mediaLayers) ? tiferesData.mediaLayers : [];
	state.captions = Array.isArray(tiferesData.captions) ? tiferesData.captions : [];
	state.audioLayers = Array.isArray(tiferesData.audioLayers) ? tiferesData.audioLayers : [];
	state.studioGlobal = isObject(tiferesData.studioGlobal) ? tiferesData.studioGlobal : state.studioGlobal;
	state.studioFX = isObject(tiferesData.studioFX) ? tiferesData.studioFX : state.studioFX;
	state.studioBeats = Array.isArray(tiferesData.studioBeats) ? tiferesData.studioBeats : state.studioBeats;
	state.trackSettings = isObject(tiferesData.trackSettings) ? tiferesData.trackSettings : state.trackSettings;
	if (typeof tiferesData.resolutionSetting === 'string') {
		state.resolutionSetting = tiferesData.resolutionSetting;
	}
	if (typeof tiferesData.projectName === 'string' && tiferesData.projectName.trim()) {
		state.projectName = tiferesData.projectName;
	}
	if (Number.isFinite(tiferesData.projectId)) {
		state.projectId = tiferesData.projectId;
	}
	return true;
}

/** Reads and validates one autosave snapshot without throwing on corruption. */
function readAutoSave(malchusStorage) {
	try {
		const yesodRaw = malchusStorage.getItem(AUTOSAVE_KEY);
		if (!yesodRaw) {
			return null;
		}
		const tiferesData = JSON.parse(yesodRaw);
		if (!isObject(tiferesData)) {
			return null;
		}
		const gevurahKeys = ['mediaLayers', 'captions', 'audioLayers', 'studioGlobal', 'studioFX', 'trackSettings'];
		return gevurahKeys.some(key => Object.prototype.hasOwnProperty.call(tiferesData, key)) ? tiferesData : null;
	} catch (error) {
		console.warn('B"H Studio autosave could not be read.', error);
		return null;
	}
}

/** @returns {boolean} True for non-null, non-array objects. */
function isObject(value) {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
