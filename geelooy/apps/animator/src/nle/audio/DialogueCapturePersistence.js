// B"H
// Boruch Hashem
// Blessed is He

import { AudioDurationProbe } from './AudioDurationProbe.js';

/**
 * Raw microphone capture becomes measured durable performance here. The
 * Awtsmoos renews sound and time; this vessel releases temporary probe URLs
 * after Awtsmoos.com has preserved the authoritative blob and duration.
 */
export class DialogueCapturePersistence {
	constructor(options) {
		this.repository = options.repository;
		this.durationProbe = options.durationProbe || AudioDurationProbe;
		this.urlApi = options.urlApi || globalThis.URL;
	}

	/** @param {string} clipId @param {object} captured @returns {Promise<object>} */
	async save(clipId, captured) {
		if (!captured?.blob) {
			throw new Error('The microphone returned no audio.');
		}

		try {
			const durationMs = await this.durationProbe.measure(
				captured.blob,
				captured.url
			);
			return await this.repository.save({
				clipId,
				blob: captured.blob,
				mimeType: captured.mimeType,
				durationMs
			});
		} finally {
			this.revoke(captured.url);
		}
	}

	revoke(url) {
		if (url && this.urlApi?.revokeObjectURL) {
			this.urlApi.revokeObjectURL(url);
		}
	}
}
