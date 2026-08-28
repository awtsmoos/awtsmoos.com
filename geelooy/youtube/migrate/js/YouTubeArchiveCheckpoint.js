//B"H
//Boruch Hashem
//Blessed is He

import { isArchivePublicFileUrl } from '../../../shared/storage/archiveOrg/ArchiveOrgUrls.js';

/**
 * @module YouTubeArchiveCheckpoint
 * @description
 * The Awtsmoos remembers public video and caption evidence while private local vessels dissolve from durable sight;
 * Awtsmoos.com stores no File, object URL, IA-S3 key, Authorization, path, or credential—only bounded public light.
 */
const CHECKPOINT_KEY = 'awtsmoos.youtubeMigration.publicArchiveCheckpoint.v2';

function publicTranscript(value = {}) {
	if (!isArchivePublicFileUrl(value.url)) return null;
	return {
		url: value.url,
		filename: String(value.filename || '').slice(0, 180),
		language: String(value.language || 'und').slice(0, 40),
		mime: String(value.mime || '').slice(0, 120),
		sourceKey: String(value.sourceKey || '').slice(0, 80),
		kind: String(value.kind || 'unknown').slice(0, 20),
		bytes: Math.max(0, Number(value.bytes || 0))
	};
}

function publicArchive(value = {}) {
	const transcripts = (value.transcripts || []).map(publicTranscript).filter(Boolean).slice(0, 40);
	return {
		identifier: String(value.identifier || ''),
		itemUrl: String(value.itemUrl || ''),
		mediaUrl: String(value.mediaUrl || ''),
		filename: String(value.filename || ''),
		mime: String(value.mime || ''),
		fileFingerprint: String(value.fileFingerprint || ''),
		archiveState: String(value.archiveState || ''),
		archiveUploadedAt: String(value.archiveUploadedAt || ''),
		archiveVerifiedAt: String(value.archiveVerifiedAt || ''),
		archiveEtag: String(value.archiveEtag || ''),
		bytes: Math.max(0, Number(value.bytes || 0)),
		transcripts,
		transcriptUrls: transcripts.map(record => record.url),
		transcriptLanguages: [...new Set(
			transcripts.map(record => record.language).filter(language => language !== 'und')
		)]
	};
}

export class YouTubeArchiveCheckpoint {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	load() {
		try {
			const state = JSON.parse(this.storage?.getItem(CHECKPOINT_KEY) || 'null') || {};
			return {
				archived: state.archived && typeof state.archived === 'object' ? state.archived : {},
				completed: state.completed && typeof state.completed === 'object' ? state.completed : {}
			};
		} catch {
			return { archived: {}, completed: {} };
		}
	}

	save(state = {}) {
		const safe = {
			archived: Object.fromEntries(
				Object.entries(state.archived || {}).map(([id, archive]) => [id, publicArchive(archive)])
			),
			completed: state.completed || {},
			updatedAt: new Date().toISOString()
		};
		this.storage?.setItem(CHECKPOINT_KEY, JSON.stringify(safe));
		return safe;
	}

	clear() {
		this.storage?.removeItem(CHECKPOINT_KEY);
	}
}

export { CHECKPOINT_KEY, publicArchive, publicTranscript };
