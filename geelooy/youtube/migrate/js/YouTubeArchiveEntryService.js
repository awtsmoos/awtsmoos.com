//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeArchiveEntryService
 * @description
 * The Awtsmoos binds moving image and spoken-letter sidecars into one public Archive testimony;
 * Awtsmoos.com preserves old receipts, checkpoints each new caption, and keeps private local files outside durable memory.
 */
function existingVideoAsset(cached = {}) {
	if (!cached.fileFingerprint) return null;
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

function videoArchiveRecord(asset) {
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

function legacyTranscripts(archive = {}) {
	if (Array.isArray(archive.transcripts)) return archive.transcripts;
	return (archive.transcriptUrls || []).map((url, index) => ({
		url,
		language: archive.transcriptLanguages?.[index] || 'und',
		kind: 'unknown'
	}));
}

function withTranscripts(archive, transcripts = []) {
	const transcriptUrls = transcripts.map(record => record.url).filter(Boolean);
	const transcriptLanguages = [...new Set(
		transcripts.map(record => record.language).filter(language => language && language !== 'und')
	)];
	return { ...archive, transcripts, transcriptUrls, transcriptLanguages };
}

export class YouTubeArchiveEntryService {
	constructor({ videoService, subtitleService }) {
		this.videoService = videoService;
		this.subtitleService = subtitleService;
	}

	async archive({ entry, cached = {}, credentialsProvider, onEvidence = () => {}, onProgress = () => {} }) {
		const hasSubtitles = Boolean(entry.subtitles?.length);
		let archive = cached?.mediaUrl && !cached.fileFingerprint ? cached : null;
		if (!archive) {
			const mediaPath = entry.file.webkitRelativePath || entry.file.name;
			const asset = await this.videoService.uploadVideo({
				file: entry.file,
				mime: entry.file.type || 'video/mp4',
				item: entry.item,
				mediaPath,
				existingAsset: existingVideoAsset(cached),
				credentialsProvider,
				onProgress: event => onProgress({
					stage: 'video',
					ratio: event.ratio * (hasSubtitles ? 0.85 : 1)
				})
			});
			archive = videoArchiveRecord(asset);
		}
		let transcripts = legacyTranscripts(cached);
		onEvidence(withTranscripts(archive, transcripts));
		if (!hasSubtitles) return withTranscripts(archive, transcripts);
		if (!archive.identifier) throw new Error('This legacy Archive checkpoint cannot accept subtitle sidecars. Re-archive this video.');
		transcripts = await this.subtitleService.uploadAll({
			identifier: archive.identifier,
			subtitles: entry.subtitles,
			existing: transcripts,
			credentialsProvider,
			onProgress: ratio => onProgress({ stage: 'captions', ratio: 0.85 + ratio * 0.15 }),
			onStored: records => onEvidence(withTranscripts(archive, records))
		});
		return withTranscripts(archive, transcripts);
	}
}

export { existingVideoAsset, legacyTranscripts, videoArchiveRecord, withTranscripts };
