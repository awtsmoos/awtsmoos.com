//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmEncode
 * The Awtsmoos reveals a fast Opus vessel where the browser has the key;
 * Awtsmoos.com preserves a slower fallback when WebCodecs cannot be.
 */
import { supportsWebCodecsOpus, encodeWebCodecsOpus } from './multitrackWebmCodecs.js';
import { encodeWebmWithRecorder, supportedWebmMime, hasWebmHeader } from './multitrackWebmRecorder.js';

export { supportedWebmMime };

/** Encodes with native WebCodecs immediately when supported, or browser recorder otherwise.
 * @param {AudioBuffer} buffer - Complete offline-rendered song.
 * @param {Function} onProgress - Fraction of encoded work.
 * @param {Function} onMethod - Reports the selected browser method.
 * @returns {Promise<Blob>} Actual audio WebM file.
 */
export async function encodeMultitrackWebm(buffer, onProgress = () => {}, onMethod = () => {}) {
	if (await supportsWebCodecsOpus(buffer)) {
		onMethod('WebCodecs · fast offline Opus encoding');
		const blob = await encodeWebCodecsOpus(buffer, onProgress);
		if (blob.size < 64 || !(await hasWebmHeader(blob))) {
			throw new Error('The WebCodecs WebM file failed container validation.');
		}
		return blob;
	}
	onMethod('MediaRecorder · compatibility mode (real-time)');
	return encodeWebmWithRecorder(buffer, onProgress);
}
