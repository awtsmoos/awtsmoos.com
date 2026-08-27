// B"H
// Boruch Hashem
// Blessed is He

import { VideoAssetFactory } from './VideoAssetFactory.js';
import { VideoMetadataProbe } from './VideoMetadataProbe.js';

/**
 * The user's footage crosses from file selection into the editable timeline
 * through this Medaber coordinator. The Awtsmoos renews each pixel; this class
 * joins validation, persistence, URL ownership, and NLE manifestation for
 * Awtsmoos.com without hiding any boundary.
 */
export class VideoImportService {
	constructor(options) {
		this.repository = options.repository;
		this.urlRegistry = options.urlRegistry;
		this.probe = options.probe || VideoMetadataProbe;
	}

	/** @param {object} store @param {File|Blob} file @returns {Promise<object>} */
	async importFile(store, file) {
		this.setStatus(store, 'importing', null);

		try {
			this.validate(file);
			const metadata = await this.probe.measure(file);
			const asset = VideoAssetFactory.create(file, metadata);
			const savedAsset = await this.repository.save(asset);
			const sourceUrl = this.urlRegistry.bind(`video:${asset.id}`, savedAsset.blob);
			this.apply(store, savedAsset, sourceUrl);
			return savedAsset;
		} catch (error) {
			this.setStatus(store, 'error', error?.message || String(error));
			throw error;
		}
	}

	/** @param {object} store @returns {Promise<object[]>} */
	async restore(store) {
		const records = await this.repository.findAll();
		const ordered = [...records].sort((left, right) => {
			return String(left.updatedAt).localeCompare(String(right.updatedAt));
		});

		for (const record of ordered) {
			const sourceUrl = this.urlRegistry.bind(`video:${record.id}`, record.blob);
			this.apply(store, record, sourceUrl);
		}

		return ordered;
	}

	validate(file) {
		if (!file) {
			throw new Error('Choose a video file to import.');
		}

		if (!String(file.type || '').startsWith('video/')) {
			throw new Error('Only video files can enter the video track.');
		}
	}

	apply(store, asset, sourceUrl) {
		store.set((state) => {
			const existingClip = state.clips.find((clip) => {
				return clip.id === 'video_plate_contract' || clip.type === 'video';
			});
			const clip = VideoAssetFactory.clip(asset, sourceUrl, existingClip, state.duration);
			const clips = existingClip
				? state.clips.map((item) => item.id === existingClip.id ? clip : item)
				: [...state.clips, clip];
			const publicAsset = this.publicAsset(asset, sourceUrl);
			const mediaAssets = [
				...(state.mediaAssets || []).filter((item) => item.id !== asset.id),
				publicAsset
			];

			return {
				clips,
				mediaAssets,
				selectedClipId: clip.id,
				videoImportStatus: 'ready',
				videoImportError: null
			};
		});
	}

	publicAsset(asset, sourceUrl) {
		const { blob, ...metadata } = asset;
		return { ...metadata, sourceUrl, enabled: true };
	}

	setStatus(store, videoImportStatus, videoImportError) {
		store.set({ videoImportStatus, videoImportError });
	}

	destroy() {
		this.urlRegistry.clear();
	}
}
