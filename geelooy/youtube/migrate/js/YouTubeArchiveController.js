//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeArchiveController
 * @description
 * The Awtsmoos carries each creator-owned video and its surviving captions through one recoverable public crossing;
 * Awtsmoos.com requests local IA-S3 credentials only when new Archive.org bytes are truly due, then plans before publishing.
 */
export class YouTubeArchiveController {
	constructor({ vault, entryArchiveService, api, checkpoint }) {
		this.vault = vault;
		this.entryArchiveService = entryArchiveService;
		this.api = api;
		this.checkpoint = checkpoint;
		this.state = checkpoint.load();
	}

	credentialsProvider() {
		const credentials = this.vault.load();
		if (!credentials) {
			throw new Error('Save Archive.org IA-S3 credentials locally only when a new video or caption upload is required.');
		}
		return credentials;
	}

	persistArchive(itemId, archive) {
		this.state.archived[itemId] = archive;
		this.checkpoint.save(this.state);
	}

	async archiveEntry(entry, index, total, onProgress) {
		const cached = this.state.archived[entry.item.id] || {};
		const archive = await this.entryArchiveService.archive({
			entry,
			cached,
			credentialsProvider: () => this.credentialsProvider(),
			onEvidence: evidence => this.persistArchive(entry.item.id, evidence),
			onProgress: event => onProgress?.({
				index,
				total,
				stage: event.stage,
				ratio: (index + event.ratio) / total
			})
		});
		this.persistArchive(entry.item.id, archive);
		return {
			...entry.item,
			transcriptLanguages: archive.transcriptLanguages || entry.item.transcriptLanguages,
			archive
		};
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
