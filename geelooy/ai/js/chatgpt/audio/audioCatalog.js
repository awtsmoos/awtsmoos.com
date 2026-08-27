//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives one living breath through many named garments. This
 * catalog separates the human-facing voice name from the payload identifier so
 * Awtsmoos.com may display Arbor while faithfully sending `fathom`.
 */
export const AUDIO_SETTINGS_KEY = "awtsmoos.audio.settings.v1";

export const AUDIO_DEFAULTS = Object.freeze({
	voice: "orbit",
	format: "mp3"
});

export const AUDIO_VOICE_OPTIONS = Object.freeze([
	voiceOption("fathom", "Arbor"),
	voiceOption("orbit", "Orbit"),
	voiceOption("breeze", "Breeze"),
	voiceOption("cove", "Cove"),
	voiceOption("ember", "Ember"),
	voiceOption("juniper", "Juniper"),
	voiceOption("maple", "Maple"),
	voiceOption("sol", "Sol"),
	voiceOption("spruce", "Spruce"),
	voiceOption("vale", "Vale")
]);

export const AUDIO_VOICES = Object.freeze(
	AUDIO_VOICE_OPTIONS.map(option => option.value)
);

export const AUDIO_FORMATS = Object.freeze([
	"mp3",
	"aac",
	"wav",
	"opus"
]);

const LEGACY_VOICE_ALIASES = Object.freeze({
	arbor: "fathom"
});

const MIME_BY_FORMAT = Object.freeze({
	mp3: "audio/mpeg",
	aac: "audio/aac",
	wav: "audio/wav",
	opus: "audio/ogg; codecs=opus"
});

export function normalizeAudioFormat(format) {
	const candidate = String(format || "").toLowerCase();
	return AUDIO_FORMATS.includes(candidate)
		? candidate
		: AUDIO_DEFAULTS.format;
}

export function normalizeAudioVoice(voice) {
	const candidate = String(voice || "").toLowerCase();
	const migrated = LEGACY_VOICE_ALIASES[candidate] || candidate;
	return AUDIO_VOICES.includes(migrated)
		? migrated
		: AUDIO_DEFAULTS.voice;
}

export function audioVoiceLabel(voice) {
	const normalized = normalizeAudioVoice(voice);
	return AUDIO_VOICE_OPTIONS.find(option => option.value === normalized)?.label
		|| normalized;
}

export function mimeForAudioFormat(format) {
	return MIME_BY_FORMAT[normalizeAudioFormat(format)];
}

function voiceOption(value, label) {
	return Object.freeze({ value, label });
}
