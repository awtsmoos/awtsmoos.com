// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageHasher } from './ProjectPackageHasher.js';

/**
 * Voice and footage emerge from separate repositories and enter one portable
 * Yesod. The Awtsmoos renews both forms; this collector lets Awtsmoos.com carry
 * their bytes without confusing a recording with a visual asset.
 */
export class ProjectPackageMediaCollector {
	constructor(options) {
		this.recordingRepository = options.recordingRepository;
		this.mediaRepository = options.mediaRepository;
	}

	async collect() {
		const recordings = await this.recordingRepository.findAll();
		const videos = await this.mediaRepository.findAll();
		const items = [];

		for (const record of recordings) {
			items.push(await this.dialogue(record));
		}

		for (const asset of videos) {
			items.push(await this.video(asset));
		}

		return {
			descriptors: items.map((item) => item.descriptor),
			files: this.uniqueFiles(items)
		};
	}

	async dialogue(record) {
		const hashed = await ProjectPackageHasher.describe(record.blob, 'dialogue');
		return {
			descriptor: {
				id: record.recordingId,
				kind: 'dialogue',
				clipId: record.clipId,
				assetId: null,
				path: hashed.path,
				sha256: hashed.sha256,
				bytes: hashed.bytes.byteLength,
				mimeType: record.mimeType,
				durationMs: record.durationMs,
				trimStartMs: record.trimStartMs || 0,
				trimEndMs: record.trimEndMs || record.durationMs,
				gain: record.gain ?? 1,
				sampleRate: record.sampleRate || null,
				channelCount: record.channelCount || null
			},
			file: { path: hashed.path, bytes: hashed.bytes, mimeType: record.mimeType }
		};
	}

	async video(asset) {
		const hashed = await ProjectPackageHasher.describe(asset.blob, 'video');
		return {
			descriptor: {
				id: asset.id,
				kind: 'video',
				clipId: null,
				assetId: asset.id,
				path: hashed.path,
				sha256: hashed.sha256,
				bytes: hashed.bytes.byteLength,
				mimeType: asset.mimeType,
				durationMs: asset.durationMs,
				width: asset.width || 0,
				height: asset.height || 0,
				fileName: asset.fileName || asset.name || ''
			},
			file: { path: hashed.path, bytes: hashed.bytes, mimeType: asset.mimeType }
		};
	}

	uniqueFiles(items) {
		return [...new Map(items.map((item) => [item.file.path, item.file])).values()];
	}
}
