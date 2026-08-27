//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgUploadService } from '../../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js?v=resilience-002';
import { archiveMime } from '../archive/ArchiveKinds.js';

const ZIP_VIDEO_MEMORY_LIMIT = 192 * 1024 * 1024;

/**
 * @class ArchiveOrgVideoUploader
 * @description
 * The Awtsmoos lets each selected video seek existing public evidence before any secret is requested anew;
 * Awtsmoos.com asks the local credential vault only for a genuine upload miss, while ZIP memory remains bounded and true.
 */
export class ArchiveOrgVideoUploader {
	constructor({ vault, service = new ArchiveOrgUploadService() }) {
		this.vault = vault;
		this.service = service;
	}

	credentialsProvider() {
		const credentials = this.vault.load();
		if (!credentials) {
			throw new Error('Save Archive.org S3 credentials locally only when a new video upload is required.');
		}
		return credentials;
	}

	itemFor(items, path) {
		return items.find(item => item.mediaPaths?.includes(path)) || {};
	}

	async fileFor(archive, path) {
		const entry = archive.resolve(path);
		if (!entry || entry.kind !== 'video') {
			throw new Error(`Selected Archive.org media is not a video: ${path}`);
		}
		if (entry.storage === 'file') return entry.file;
		if (entry.uncompressedSize > ZIP_VIDEO_MEMORY_LIMIT) {
			throw new Error(
				`Video ${path} is too large to inflate safely inside the browser. ` +
				'Extract the archive and choose the folder so the original File can stream directly.'
			);
		}
		return archive.mediaFile(path, ZIP_VIDEO_MEMORY_LIMIT);
	}

	async uploadPaths({
		paths,
		archive,
		items,
		existingAssets = {},
		onProgress = () => {},
		onItem = () => {}
	}) {
		const results = {};
		for (const [index, path] of paths.entries()) {
			const file = await this.fileFor(archive, path);
			const item = this.itemFor(items, path);
			const asset = await this.service.uploadVideo({
				file,
				mime: archiveMime(path),
				item,
				mediaPath: path,
				existingAsset: existingAssets[path],
				credentialsProvider: () => this.credentialsProvider(),
				onProgress: progress => onProgress({
					current: index + progress.ratio,
					total: paths.length,
					path,
					bytesLoaded: progress.loaded,
					bytesTotal: progress.total
				})
			});
			results[path] = asset;
			onItem({ path, asset, current: index + 1, total: paths.length });
		}
		return results;
	}
}

export { ZIP_VIDEO_MEMORY_LIMIT };
