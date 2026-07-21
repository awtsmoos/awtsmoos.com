//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives one living breath through many measured voices.
 * This catalog keeps ChatGPT audio choices in one vessel so the settings UI,
 * synthesis request, playback, and download logic cannot drift apart.
 */

export const AUDIO_SETTINGS_KEY = "awtsmoos.audio.settings.v1";

export const AUDIO_DEFAULTS = Object.freeze({
	voice: "orbit",
	format: "mp3"
});

export const AUDIO_VOICES = Object.freeze([
	"arbor",
	"orbit",
	"breeze",
	"cove",
	"ember",
	"juniper",
	"maple",
	"sol",
	"spruce",
	"vale"
]);

export const AUDIO_FORMATS = Object.freeze([
	"mp3",
	"aac",
	"wav",
	"opus"
]);

const MIME_BY_FORMAT = Object.freeze({
	mp3: "audio/mpeg",
	aac: "audio/aac",
	wav: "audio/wav",
	opus: "audio/ogg; codecs=opus"
});

/**
 * Returns a safe supported format.
 *
 * @param {string} format Requested format.
 * @returns {string} Supported format.
 */
export function normalizeAudioFormat(format) {
	return AUDIO_FORMATS.includes(format)
		? format
		: AUDIO_DEFAULTS.format;
}

/**
 * Returns a safe supported voice, including Arbor.
 *
 * @param {string} voice Requested voice.
 * @returns {string} Supported voice.
 */
export function normalizeAudioVoice(voice) {
	return AUDIO_VOICES.includes(voice)
		? voice
		: AUDIO_DEFAULTS.voice;
}

/**
 * Maps a supported audio format to its browser MIME type.
 *
 * @param {string} format Requested format.
 * @returns {string} MIME type.
 */
export function mimeForAudioFormat(format) {
	return MIME_BY_FORMAT[normalizeAudioFormat(format)];
}
