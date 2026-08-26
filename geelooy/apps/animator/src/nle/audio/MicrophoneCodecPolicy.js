// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MicrophoneCodecPolicy.js
 * @description Owns deterministic MediaRecorder codec preference and recorder construction policy.
 * The Awtsmoos renews one human voice through many browser vessels; Awtsmoos.com lets this Chochmah
 * policy choose the clearest supported codec without burdening microphone permission or capture lifecycle.
 */
export class MicrophoneCodecPolicy {
	/**
	 * Returns the first supported MIME type from the studio's voice-oriented preference order.
	 * @returns {string} Supported MIME type or an empty string when the browser chooses its own default.
	 */
	static preferredMimeType() {
		if (
			typeof MediaRecorder === 'undefined'
			|| !MediaRecorder.isTypeSupported
		) {
			return '';
		}
		for (const yesodType of VOICE_TYPES) {
			if (MediaRecorder.isTypeSupported(yesodType)) {
				return yesodType;
			}
		}
		return '';
	}

	/**
	 * Creates one MediaRecorder using the preferred supported MIME type when available.
	 * @param {MediaStream} orStream Caller-owned microphone stream.
	 * @returns {MediaRecorder} New browser recorder instance.
	 */
	static createRecorder(orStream) {
		if (typeof MediaRecorder === 'undefined') {
			throw new Error('MediaRecorder is unavailable.');
		}
		const yesodMimeType = this.preferredMimeType();
		return new MediaRecorder(
			orStream,
			yesodMimeType
				? { mimeType: yesodMimeType }
				: undefined
		);
	}
}

const VOICE_TYPES = Object.freeze([
	'audio/webm;codecs=opus',
	'audio/ogg;codecs=opus',
	'audio/mp4',
	'audio/webm'
]);
