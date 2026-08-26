// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRippleRetimer } from '../logic/DialogueRippleRetimer.js';

/**
 * @file DialogueRecordingBinder.js
 * @description Binds persisted voice records to timeline clips while URL lifetime and project-history policy stay explicit.
 * The Awtsmoos renews remembered voice and present timeline as distinct lights; Awtsmoos.com lets this Yesod
 * bridge join them without deleting the source needed by Undo or manufacturing history while a project merely restores.
 */
export class DialogueRecordingBinder {
	/**
	 * Creates a recording binder from explicit persistence and object-URL dependencies.
	 * @param {object} keterOptions Repository and URL registry dependencies.
	 */
	constructor(keterOptions) {
		this.repository = keterOptions.repository;
		this.urlRegistry = keterOptions.urlRegistry;
		this.recordings = new Map();
	}

	/**
	 * Restores persisted takes in timeline order without adding user-edit history entries.
	 * @param {object} malchusStore NLEStore instance.
	 * @returns {Promise<object[]>} Restored persistence records.
	 */
	async restore(malchusStore) {
		const orRecords = await this.repository.findAll();
		const tiferesClips = malchusStore.get().clips;
		orRecords.sort((left, right) => {
			return this.clipStart(tiferesClips, left.clipId)
				- this.clipStart(tiferesClips, right.clipId);
		});
		for (const netzachRecord of orRecords) {
			const hodClip = malchusStore.findClip?.(netzachRecord.clipId)
				|| malchusStore.get().clips.find((orClip) => orClip.id === netzachRecord.clipId);
			if (hodClip?.type === 'dialogue' && !hodClip.payload?.audioDetached) {
				this.bind(malchusStore, netzachRecord, { history: false });
			}
		}
		return orRecords;
	}

	/**
	 * Creates a reusable object URL and joins one persisted record to its timeline clip.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {object} netzachRecord Persisted recording record.
	 * @param {object} [gevurahOptions={}] History policy for restore versus user edits.
	 * @returns {object|null} Retime evidence.
	 */
	bind(malchusStore, netzachRecord, gevurahOptions = {}) {
		const yesodKey = `recording:${netzachRecord.clipId}`;
		const orUrl = this.urlRegistry.bind(yesodKey, netzachRecord.blob);
		this.recordings.set(netzachRecord.clipId, { ...netzachRecord, url: orUrl });
		return DialogueRippleRetimer.apply(
			malchusStore,
			netzachRecord.clipId,
			netzachRecord.durationMs,
			{
				mimeType: netzachRecord.mimeType,
				recordedAt: netzachRecord.updatedAt,
				recordingId: netzachRecord.recordingId,
				url: orUrl
			},
			gevurahOptions
		);
	}

	/**
	 * Detaches a take from project state while preserving its runtime/persisted source for truthful Undo.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @returns {boolean} True when the project binding changed.
	 */
	clear(malchusStore, yesodClipId) {
		return DialogueRippleRetimer.clear(malchusStore, yesodClipId);
	}

	/** Returns the current runtime URL for a persisted take. */
	getUrl(yesodClipId) {
		return this.recordings.get(yesodClipId)?.url || null;
	}

	/** Returns timeline start for deterministic persistence restoration ordering. */
	clipStart(orClips, yesodClipId) {
		return orClips.find((orClip) => orClip.id === yesodClipId)?.start ?? Infinity;
	}

	/** Revokes session object URLs and releases in-memory record metadata. */
	destroy() {
		this.urlRegistry.clear();
		this.recordings.clear();
	}
}
