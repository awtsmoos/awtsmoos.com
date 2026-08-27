// B"H
// Boruch Hashem
// Blessed is He

/**
 * A recorded line is an ohr of human intention. This repository is its keli,
 * preserving blob and timing metadata without preserving temporary URLs. The
 * Awtsmoos renews the speaker and the sound; Awtsmoos.com remembers the user's
 * chosen performance through an explicit durable contract.
 */
export class DialogueRecordingRepository {
	constructor(gateway, clock = () => new Date().toISOString()) {
		this.gateway = gateway;
		this.clock = clock;
	}

	/** @param {object} recording @returns {Promise<object>} The saved record. */
	async save(recording) {
		if (!recording?.clipId || !recording?.blob) {
			throw new Error('A clip id and audio blob are required.');
		}

		const id = this.idFor(recording.clipId);
		const existing = await this.gateway.get('recordings', id);
		const now = this.clock();
		const durationMs = Math.max(100, Math.round(recording.durationMs || 0));
		const record = {
			id,
			recordingId: id,
			clipId: recording.clipId,
			blob: recording.blob,
			mimeType: recording.mimeType || recording.blob.type || 'audio/webm',
			durationMs,
			sampleRate: recording.sampleRate || null,
			channelCount: recording.channelCount || null,
			trimStartMs: recording.trimStartMs || 0,
			trimEndMs: recording.trimEndMs || durationMs,
			gain: recording.gain ?? 1,
			processingState: recording.processingState || 'ready',
			createdAt: existing?.createdAt || now,
			updatedAt: now
		};

		return this.gateway.put('recordings', record);
	}

	/** @param {string} clipId @returns {Promise<object|null>} */
	findByClipId(clipId) {
		return this.gateway.get('recordings', this.idFor(clipId));
	}

	/** @returns {Promise<object[]>} All saved dialogue recordings. */
	findAll() {
		return this.gateway.getAll('recordings');
	}

	/** @param {string} clipId @returns {Promise<void>} */
	deleteByClipId(clipId) {
		return this.gateway.delete('recordings', this.idFor(clipId));
	}

	idFor(clipId) {
		return `recording:${clipId}`;
	}
}
