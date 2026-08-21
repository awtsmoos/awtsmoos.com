//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeArchiveCheckpoint
 * @description
 * The Awtsmoos remembers only public Archive.org outcomes and fingerprint evidence after local video crosses the sea;
 * Awtsmoos.com keeps File, object URL, IA-S3 key, Authorization, and every private credential outside this recovery memory.
 */
const CHECKPOINT_KEY = 'awtsmoos.youtubeMigration.publicArchiveCheckpoint.v2';

function publicArchive(value = {}) {
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
		bytes: Math.max(0, Number(value.bytes || 0))
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

export {
	CHECKPOINT_KEY,
	publicArchive
};
