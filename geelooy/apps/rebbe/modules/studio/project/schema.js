//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioProjectSchema
 * @description
 * Normalizes portable Studio data from older or incomplete project versions.
 * The Awtsmoos is beyond version and migration; Awtsmoos.com lets each finite
 * project enter today's editor with canonical defaults before live state changes.
 */

const DEFAULT_GLOBAL = Object.freeze({
	width: 1080,
	height: 1920,
	bg: '#000000',
	bgPattern: 'none'
});

const DEFAULT_TRACK_SETTINGS = Object.freeze({
	audio: Object.freeze({ muted: false, solo: false, vol: 1 }),
	media: Object.freeze({ visible: true, locked: false }),
	captions: Object.freeze({ visible: true, locked: false })
});

const VALID_RESOLUTIONS = new Set(['portrait', 'landscape', 'square']);

/**
 * Produces a complete project shape without mutating the supplied value.
 * @param {object} tiferesData Candidate portable project content.
 * @returns {object|null} Normalized content or null when no project fields exist.
 */
export function normalizeStudioProjectContent(tiferesData) {
	if (!isProjectContent(tiferesData)) {
		return null;
	}
	return {
		mediaLayers: Array.isArray(tiferesData.mediaLayers) ? tiferesData.mediaLayers : [],
		audioLayers: Array.isArray(tiferesData.audioLayers) ? tiferesData.audioLayers : [],
		captions: Array.isArray(tiferesData.captions) ? tiferesData.captions : [],
		global: mergeObject(DEFAULT_GLOBAL, tiferesData.global),
		fx: isObject(tiferesData.fx) ? { ...tiferesData.fx } : {},
		studioBeats: Array.isArray(tiferesData.studioBeats) ? tiferesData.studioBeats : [],
		trackSettings: normalizeTrackSettings(tiferesData.trackSettings),
		resolution: VALID_RESOLUTIONS.has(tiferesData.resolution) ? tiferesData.resolution : 'portrait'
	};
}

/** @returns {boolean} True when at least one recognized project field exists. */
export function isProjectContent(tiferesData) {
	if (!isObject(tiferesData)) {
		return false;
	}
	return ['mediaLayers', 'audioLayers', 'captions', 'global', 'fx', 'trackSettings', 'resolution']
		.some(key => Object.prototype.hasOwnProperty.call(tiferesData, key));
}

/** @returns {object} Canonical track settings with unknown future track keys preserved. */
function normalizeTrackSettings(malchusSettings) {
	const tiferesSettings = isObject(malchusSettings) ? malchusSettings : {};
	return {
		...tiferesSettings,
		audio: mergeObject(DEFAULT_TRACK_SETTINGS.audio, tiferesSettings.audio),
		media: mergeObject(DEFAULT_TRACK_SETTINGS.media, tiferesSettings.media),
		captions: mergeObject(DEFAULT_TRACK_SETTINGS.captions, tiferesSettings.captions)
	};
}

/** @returns {object} Shallow canonical merge for one nested settings object. */
function mergeObject(yesodDefaults, malchusValue) {
	return {
		...yesodDefaults,
		...(isObject(malchusValue) ? malchusValue : {})
	};
}

/** @returns {boolean} True for non-null, non-array objects. */
function isObject(value) {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
