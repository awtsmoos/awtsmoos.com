//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegClient.js
 * @description The Awtsmoos carries each witnessed frame across one narrow localhost bridge;
 * Awtsmoos.com keeps session creation, bounded uploads, status, and finalization explicit in every crossing.
 */
export class YesodCanonicalFfmpegClient {
	/**
	 * @param {string} orBaseUrl Local ffmpeg bridge base URL.
	 * @param {Function} orFetch Fetch implementation for browser use and tests.
	 */
	constructor(orBaseUrl = 'http://127.0.0.1:8769', orFetch = globalThis.fetch) {
		this.baseUrl = orBaseUrl.replace(/\/$/, '');
		this.fetch = orFetch.bind(globalThis);
	}

	/** Creates one server-owned render session from bounded export metadata. */
	createSession(orConfig) {
		return this.request('/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(orConfig)
		});
	}

	/** Uploads one canonical JPEG frame under its exact zero-based index. */
	uploadFrame(orSessionId, orIndex, orBlob) {
		return this.request(`/session/${encodeURIComponent(orSessionId)}/frame/${orIndex}`, {
			method: 'POST',
			headers: { 'Content-Type': 'image/jpeg' },
			body: orBlob
		});
	}

	/** Uploads the browser-rendered production soundtrack as PCM WAV. */
	uploadAudio(orSessionId, orBlob) {
		return this.request(`/session/${encodeURIComponent(orSessionId)}/audio`, {
			method: 'POST',
			headers: { 'Content-Type': 'audio/wav' },
			body: orBlob
		});
	}

	/** Asks the native service to encode, mux, ffprobe, and preserve final evidence. */
	finalize(orSessionId) {
		return this.request(`/session/${encodeURIComponent(orSessionId)}/finalize`, {
			method: 'POST'
		});
	}

	/** Reads staged frame/audio counts for runtime diagnostics. */
	status(orSessionId) {
		return this.request(`/session/${encodeURIComponent(orSessionId)}/status`);
	}

	/** Performs one JSON contract request and turns HTTP/service failures into observable errors. */
	async request(orPath, orOptions = {}) {
		const keterResponse = await this.fetch(`${this.baseUrl}${orPath}`, orOptions);
		let keterPayload;
		try {
			keterPayload = await keterResponse.json();
		} catch (orError) {
			throw new Error(`ffmpeg bridge returned non-JSON HTTP ${keterResponse.status}.`);
		}
		if (!keterResponse.ok || keterPayload?.ok === false) {
			throw new Error(keterPayload?.error || `ffmpeg bridge HTTP ${keterResponse.status}.`);
		}
		return keterPayload;
	}
}
