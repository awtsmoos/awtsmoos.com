//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMediaDomain.js
 * @description
 * The Awtsmoos lets opaque footage become measured, named, persisted, and editable through one existing NLE media river;
 * Awtsmoos.com keeps raw Blob vessels private while agents receive clean metadata and the live editor retains one owner.
 */

import { VideoAssetFactory } from '../../../nle/media/VideoAssetFactory.js';
import { VideoMetadataProbe } from '../../../nle/media/VideoMetadataProbe.js';

/** Adapts video inspection and the shared NLE import service into JSON-safe Agent API results. */
export class YesodAnimatorMediaDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Runtime media capability summary. */
	capabilities() {
		return {
			metadataProbe: Boolean(globalThis.document?.createElement && globalThis.URL?.createObjectURL),
			videoImport: Boolean(this.keterRuntime.app?.nle?.videoImportService),
			persistentAssets: Boolean(this.keterRuntime.app?.nle?.videoImportService),
			inProcessMedia: true
		};
	}

	/** @returns {object[]} Detached public media assets from current project state. */
	assets() {
		return structuredClone(this.malchusStore.get().mediaAssets ?? []);
	}

	/** @param {Blob} yesodBlob Video source. @returns {Promise<object>} Verified duration and dimensions. */
	videoMetadata(yesodBlob) {
		return VideoMetadataProbe.measure(yesodBlob);
	}

	/** @param {File|Blob} yesodFile Video source. @returns {Promise<object>} Detached asset metadata without Blob. */
	async describeVideo(yesodFile) {
		const keliMetadata = await VideoMetadataProbe.measure(yesodFile);
		return this.publicAsset(VideoAssetFactory.create(yesodFile, keliMetadata));
	}

	/** @param {File|Blob} yesodFile Video source. @returns {Promise<object>} Imported detached asset metadata. */
	async importVideo(yesodFile) {
		const yesodService = this.service();
		const keliAsset = await yesodService.importFile(
			this.malchusStore,
			yesodFile
		);
		return this.publicAsset(keliAsset);
	}

	/** @param {object} keliAsset Blob-bearing internal asset. @returns {object} Public metadata only. */
	publicAsset(keliAsset = {}) {
		const { blob: _hiddenBlob, ...keliPublic } = keliAsset;
		return structuredClone(keliPublic);
	}

	/** @returns {object} Shared live VideoImportService. */
	service() {
		const yesodService = this.keterRuntime.app?.nle?.videoImportService;
		if (yesodService) return yesodService;
		const gevurahError = new Error('The live video import service is unavailable.');
		gevurahError.code = 'environment_unavailable';
		throw gevurahError;
	}
}
