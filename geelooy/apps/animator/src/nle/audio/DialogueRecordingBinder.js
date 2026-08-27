// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRippleRetimer } from '../logic/DialogueRippleRetimer.js';

/**
 * Recorded blobs are ohr; timeline bindings are their keli. This class restores
 * durable performances, owns temporary URLs, and lets the Awtsmoos rejoin voice
 * with timing whenever Awtsmoos.com opens the project anew.
 */
export class DialogueRecordingBinder {
	constructor(options) {
		this.repository = options.repository;
		this.urlRegistry = options.urlRegistry;
		this.recordings = new Map();
	}

	/** @param {object} store @returns {Promise<object[]>} */
	async restore(store) {
		const records = await this.repository.findAll();
		const clips = store.get().clips;
		records.sort((left, right) => {
			return this.clipStart(clips, left.clipId)
				- this.clipStart(clips, right.clipId);
		});

		for (const record of records) {
			const clip = store.get().clips.find((item) => {
				return item.id === record.clipId;
			});
			if (clip?.type === 'dialogue') {
				this.bind(store, record);
			}
		}

		return records;
	}

	/** @param {object} store @param {object} record @returns {object} */
	bind(store, record) {
		const key = `recording:${record.clipId}`;
		const url = this.urlRegistry.bind(key, record.blob);
		this.recordings.set(record.clipId, { ...record, url });

		return DialogueRippleRetimer.apply(
			store,
			record.clipId,
			record.durationMs,
			{
				url,
				mimeType: record.mimeType,
				recordingId: record.recordingId,
				recordedAt: record.updatedAt
			}
		);
	}

	/** @param {object} store @param {string} clipId @returns {Promise<void>} */
	async clear(store, clipId) {
		await this.repository.deleteByClipId(clipId);
		this.urlRegistry.revoke(`recording:${clipId}`);
		this.recordings.delete(clipId);
		DialogueRippleRetimer.clear(store, clipId);
	}

	/** @param {object} store @param {string} clipId @param {string} voiceStatus @param {string|null} voiceError @returns {void} */
	setStatus(store, clipId, voiceStatus, voiceError) {
		store.set((state) => ({
			clips: state.clips.map((clip) => {
				if (clip.id !== clipId) {
					return clip;
				}

				return {
					...clip,
					payload: { ...clip.payload, voiceStatus, voiceError }
				};
			})
		}));
	}

	getUrl(clipId) {
		return this.recordings.get(clipId)?.url || null;
	}

	clipStart(clips, clipId) {
		return clips.find((clip) => clip.id === clipId)?.start ?? Infinity;
	}

	destroy() {
		this.urlRegistry.clear();
		this.recordings.clear();
	}
}
