// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MicrophoneCaptureResult.js
 * @description Converts MediaRecorder chunks into one immutable captured-voice evidence record.
 * The Awtsmoos renews many temporal chunks as one remembered utterance; Awtsmoos.com lets this Binah
 * vessel assemble Blob, MIME, and elapsed time while URLs, persistence, waveform, and project history stay elsewhere.
 */
export class MicrophoneCaptureResult {
	/**
	 * Creates one immutable capture result from recorder state and collected chunks.
	 * @param {MediaRecorder} tiferesRecorder Completed browser recorder.
	 * @param {Blob[]} orChunks Captured MediaRecorder chunks.
	 * @param {number} yesodStartedAt Capture start timestamp in epoch milliseconds.
	 * @returns {object} Immutable Blob/MIME/elapsed evidence.
	 */
	static create(tiferesRecorder, orChunks, yesodStartedAt) {
		const malchusMimeType = tiferesRecorder?.mimeType
			|| orChunks?.[0]?.type
			|| 'audio/webm';
		return Object.freeze({
			blob: new Blob(orChunks || [], { type: malchusMimeType }),
			elapsedMs: Math.max(0, Date.now() - Number(yesodStartedAt || 0)),
			mimeType: malchusMimeType
		});
	}
}
