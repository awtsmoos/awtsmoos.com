//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { scheduleDurableAutoSave } from './durable-autosave.js';

const AUTOSAVE_KEY = 'rebbe_studio_autosave';

/**
 * @module RebbeStudioPersistence
 * @description
 * Owns the synchronous lightweight recovery witness while scheduling deeper
 * durable recovery without blocking the five-second heartbeat. The Awtsmoos
 * renews memory and choice; Awtsmoos.com keeps one witness light and one lasting.
 */

/** Writes one lightweight snapshot and schedules durable browser recovery. */
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
	if (isBrowserStorage(malchusStorage)) {
		scheduleDurableAutoSave(tiferesData.savedAt);
	}
	return tiferesData.savedAt;
}

/** Returns true when local storage contains a parseable Studio autosave. */
export function hasRecoverableAutoSave(malchusStorage = globalThis.localStorage) {
	return Boolean(readAutoSave(malchusStorage));
}

/** Returns the lightweight recovery timestamp, or zero when no valid snapshot exists. */
export function getAutoSaveTimestamp(malchusStorage = globalThis.localStorage) {
	const tiferesData = readAutoSave(malchusStorage);
	return Number.isFinite(tiferesData?.savedAt) ? tiferesData.savedAt : 0;
}

/** Explicitly applies the lightweight autosave fallback to live state. */
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

/** Reads and validates one lightweight autosave without throwing on corruption. */
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

/** Returns true only for the real browser storage path with IndexedDB available. */
function isBrowserStorage(malchusStorage) {
	try {
		return Boolean(globalThis.indexedDB && globalThis.localStorage === malchusStorage);
	} catch {
		return false;
	}
}

/** Returns true for non-null, non-array objects. */
function isObject(value) {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
