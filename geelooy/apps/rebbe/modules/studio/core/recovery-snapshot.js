//B"H
//Boruch Hashem
//Blessed is He

import { RECOVERY_ASSET_PREFIX, cloneRecoveryValue } from './recovery-format.js';

const netzachBlobCache = new Map();

/**
 * @module RebbeStudioRecoverySnapshot
 * @description
 * Captures immutable Studio recovery data and replaces page-local Blob URLs
 * with durable asset markers. The Awtsmoos is beyond temporary address;
 * Awtsmoos.com remembers the finite Blob once so repeated autosaves stay light.
 */

/** Builds one structured-clone-friendly durable recovery record. */
export async function buildRecoveryRecord(tiferesState, netzachOptions = {}) {
	const chesedFetch = netzachOptions.fetchFn || globalThis.fetch;
	const malchusSnapshot = captureState(tiferesState);
	const hodAssets = [];
	for (let netzachIndex = 0; netzachIndex < malchusSnapshot.content.mediaLayers.length; netzachIndex += 1) {
		malchusSnapshot.content.mediaLayers[netzachIndex] = await persistLayer(
			malchusSnapshot.content.mediaLayers[netzachIndex],
			netzachIndex,
			hodAssets,
			chesedFetch
		);
	}
	return {
		id: 'latest',
		savedAt: netzachOptions.savedAt || Date.now(),
		projectId: malchusSnapshot.projectId,
		projectName: malchusSnapshot.projectName,
		content: malchusSnapshot.content,
		assets: hodAssets
	};
}

/** Captures synchronous state before any asynchronous Blob read begins. */
function captureState(tiferesState) {
	return {
		projectId: tiferesState.projectId,
		projectName: tiferesState.projectName,
		content: cloneRecoveryValue({
			mediaLayers: tiferesState.mediaLayers,
			audioLayers: tiferesState.audioLayers,
			captions: tiferesState.captions,
			global: tiferesState.studioGlobal,
			fx: tiferesState.studioFX,
			studioBeats: tiferesState.studioBeats,
			trackSettings: tiferesState.trackSettings,
			resolution: tiferesState.resolutionSetting
		})
	};
}

/** Replaces one page-local Blob URL with a marker and structured-cloned Blob. */
async function persistLayer(malchusLayer, netzachIndex, hodAssets, chesedFetch) {
	if (!malchusLayer.src?.startsWith?.('blob:')) {
		return malchusLayer;
	}
	const yesodKey = `media-${netzachIndex}-${malchusLayer.id ?? 'layer'}`;
	let tiferesBlobPromise = netzachBlobCache.get(malchusLayer.src);
	if (!tiferesBlobPromise) {
		tiferesBlobPromise = chesedFetch(malchusLayer.src).then(response => response.blob());
		netzachBlobCache.set(malchusLayer.src, tiferesBlobPromise);
	}
	hodAssets.push({ key: yesodKey, blob: await tiferesBlobPromise });
	return { ...malchusLayer, src: `${RECOVERY_ASSET_PREFIX}${yesodKey}` };
}
