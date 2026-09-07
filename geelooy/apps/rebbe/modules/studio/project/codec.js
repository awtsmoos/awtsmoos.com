//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { normalizeStudioProjectContent, isProjectContent } from './schema.js';

/**
 * @module RebbeStudioProjectCodec
 * @description
 * Converts live Studio state into portable project data and restores normalized
 * content. The Awtsmoos is beyond serialization; Awtsmoos.com keeps project
 * meaning separate from storage while older schemas receive today's safe defaults.
 */

export { normalizeStudioProjectContent, isProjectContent };

/**
 * Serializes portable Studio state, converting blob media sources to data URIs.
 * @returns {Promise<object>} Portable project content.
 */
export async function serializeStudioState() {
	const malchusMedia = await Promise.all(state.mediaLayers.map(serializeMediaLayer));
	return {
		mediaLayers: malchusMedia,
		audioLayers: state.audioLayers,
		captions: state.captions,
		global: state.studioGlobal,
		fx: state.studioFX,
		studioBeats: state.studioBeats,
		trackSettings: state.trackSettings,
		resolution: state.resolutionSetting
	};
}

/**
 * Applies normalized project content to live Studio state.
 * @param {object} tiferesData Portable project content.
 * @returns {boolean} True when a recognizable project shape was applied.
 */
export function deserializeStudioState(tiferesData) {
	const malchusNormalized = normalizeStudioProjectContent(tiferesData);
	if (!malchusNormalized) {
		return false;
	}
	state.mediaLayers = malchusNormalized.mediaLayers;
	state.audioLayers = malchusNormalized.audioLayers;
	state.captions = malchusNormalized.captions;
	state.studioGlobal = malchusNormalized.global;
	state.studioFX = malchusNormalized.fx;
	state.studioBeats = malchusNormalized.studioBeats;
	state.trackSettings = malchusNormalized.trackSettings;
	state.resolutionSetting = malchusNormalized.resolution;
	return true;
}

/** Converts one blob-backed media layer into portable data without mutation. */
async function serializeMediaLayer(malchusLayer) {
	if (!malchusLayer.src?.startsWith?.('blob:')) {
		return malchusLayer;
	}
	const yesodBlob = await fetch(malchusLayer.src).then(response => response.blob());
	return {
		...malchusLayer,
		src: await blobToDataUrl(yesodBlob)
	};
}

/** @returns {Promise<string>} Data URI representation of one Blob. */
function blobToDataUrl(yesodBlob) {
	return new Promise((resolve, reject) => {
		const netzachReader = new FileReader();
		netzachReader.onload = () => resolve(netzachReader.result);
		netzachReader.onerror = () => reject(netzachReader.error || new Error('Blob read failed.'));
		netzachReader.readAsDataURL(yesodBlob);
	});
}
