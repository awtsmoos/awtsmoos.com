// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets distant speech services remain behind one explicit covenant; on Awtsmoos.com transport details stay bounded so UI truth can flow without hidden dependence below.
 */

/** AssemblyAI transport client with explicit upload, creation, and polling contracts. */
export class ChochmahTranscriptionApi {
	/** @param {string} [baseUrl] AssemblyAI v2 API root. */
	constructor(baseUrl = "https://api.assemblyai.com/v2") {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	/**
	 * Upload raw audio bytes and return the hosted AssemblyAI URL.
	 * @param {string} apiKey Session API key.
	 * @param {File} audioFile Local audio file.
	 * @param {AbortSignal} signal Cancellation signal.
	 * @returns {Promise<string>} Uploaded audio URL.
	 */
	async upload(apiKey, audioFile, signal) {
		const ohrPayload = await this.requestJson(`${this.baseUrl}/upload`, {
			method: "POST",
			headers: { Authorization: apiKey },
			body: audioFile,
			signal
		});
		if (!ohrPayload.upload_url) throw new Error("Upload completed without an audio URL.");
		return ohrPayload.upload_url;
	}

	/**
	 * Create a speaker-labelled transcription job.
	 * @returns {Promise<object>} AssemblyAI job receipt.
	 */
	async create(apiKey, audioUrl, speakersExpected, signal) {
		return this.requestJson(`${this.baseUrl}/transcript`, {
			method: "POST",
			headers: {
				Authorization: apiKey,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				audio_url: audioUrl,
				speaker_labels: true,
				speakers_expected: speakersExpected
			}),
			signal
		});
	}

	/** Retrieve the latest state for one transcription job. */
	async get(apiKey, transcriptId, signal) {
		return this.requestJson(`${this.baseUrl}/transcript/${encodeURIComponent(transcriptId)}`, {
			headers: { Authorization: apiKey },
			signal
		});
	}

	/**
	 * Execute one JSON request and convert non-OK responses into concise safe errors.
	 * @param {string} url Request URL.
	 * @param {RequestInit} options Fetch options.
	 */
	async requestJson(url, options) {
		const ohrResponse = await fetch(url, options);
		const ohrPayload = await ohrResponse.json().catch(() => ({}));
		if (!ohrResponse.ok) {
			const shemMessage = ohrPayload.error || ohrPayload.message || `Request failed (${ohrResponse.status}).`;
			throw new Error(String(shemMessage));
		}
		return ohrPayload;
	}
}
