//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeArchiveController
 * @description
 * The Awtsmoos lets legacy public checkpoints remain valid while fingerprinted video returns through shared byte truth;
 * Awtsmoos.com asks for local IA-S3 credentials only when the shared Archive.org service proves a new upload is due.
 */
export class YouTubeArchiveController {
	constructor({ vault, archiveService, api, checkpoint }) {
		this.vault = vault;
		this.archiveService = archiveService;
		this.api = api;
		this.checkpoint = checkpoint;
		this.state = checkpoint.load();
	}

	credentialsProvider() {
		const credentials = this.vault.load();
		if (!credentials) {
			throw new Error('Save Archive.org IA-S3 credentials locally only when a new video upload is required.');
		}
		return credentials;
	}

	existingAsset(cached) {
		if (!cached?.fileFingerprint) return null;
		return {
			publicPath: cached.mediaUrl,
			mime: cached.mime,
			archiveIdentifier: cached.identifier,
			archiveFilename: cached.filename,
			fileFingerprint: cached.fileFingerprint,
			archiveState: cached.archiveState,
			archiveUploadedAt: cached.archiveUploadedAt,
			archiveVerifiedAt: cached.archiveVerifiedAt,
			archiveEtag: cached.archiveEtag,
			bytes: cached.bytes
		};
	}

	archiveRecord(asset) {
		return {
			identifier: asset.archiveIdentifier,
			itemUrl: asset.archiveDetailsUrl,
			mediaUrl: asset.publicPath,
			filename: asset.archiveFilename,
			mime: asset.mime,
			fileFingerprint: asset.fileFingerprint,
			archiveState: asset.archiveState,
			archiveUploadedAt: asset.archiveUploadedAt,
			archiveVerifiedAt: asset.archiveVerifiedAt,
			archiveEtag: asset.archiveEtag,
			bytes: asset.bytes
		};
	}

	async archiveEntry(entry, index, total, onProgress) {
		const cached = this.state.archived[entry.item.id];
		if (cached?.mediaUrl && !cached.fileFingerprint) {
			return { ...entry.item, archive: cached };
		}
		const mediaPath = entry.file.webkitRelativePath || entry.file.name;
		const asset = await this.archiveService.uploadVideo({
			file: entry.file,
			mime: entry.file.type || 'video/mp4',
			item: entry.item,
			mediaPath,
			existingAsset: this.existingAsset(cached),
			credentialsProvider: () => this.credentialsProvider(),
			onProgress: event => onProgress?.({
				index,
				total,
				ratio: (index + event.ratio) / total
			})
		});
		const archive = this.archiveRecord(asset);
		this.state.archived[entry.item.id] = archive;
		this.checkpoint.save(this.state);
		return { ...entry.item, archive };
	}

	async archiveAndPlan(entries, destination, onProgress) {
		if (!entries.length) throw new Error('Choose at least one creator-owned video.');
		const items = [];
		for (const [index, entry] of entries.entries()) {
			items.push(await this.archiveEntry(entry, index, entries.length, onProgress));
		}
		return this.api.plan({
			aliasId: destination.aliasId,
			heichelId: destination.heichelId,
			fallbackSeriesId: destination.seriesId || 'root',
			playlistSeriesMap: {},
			items
		});
	}

	async publish(plan, onProgress) {
		const results = [];
		const entries = plan?.entries || [];
		for (const [index, entry] of entries.entries()) {
			const key = entry.publicationPlan.idempotencyKey;
			if (this.state.completed[key]) continue;
			const result = await this.api.publish(entry);
			this.state.completed[key] = result;
			this.checkpoint.save(this.state);
			results.push(result);
			onProgress?.({ index: index + 1, total: entries.length });
		}
		return results;
	}
}
