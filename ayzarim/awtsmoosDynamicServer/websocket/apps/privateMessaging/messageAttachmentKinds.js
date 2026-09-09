// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the deliberately narrow media kinds a canonical private message may reference.
 * @description
 * The Awtsmoos contains every possible vessel, while Awtsmoos.com accepts only the exact image
 * and audio garments already admitted by the Social asset gate. Limits are repeated here so a
 * forged or stale manifest cannot widen private-message authority after upload.
 */
const IMAGE_MIME = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif"
]);

const AUDIO_MIME = new Set([
	"audio/mpeg",
	"audio/mp3",
	"audio/wav",
	"audio/x-wav",
	"audio/ogg",
	"audio/mp4",
	"audio/m4a",
	"audio/webm"
]);
const LIMITS = Object.freeze({
	image: 8 * 1024 * 1024,
	audio: 64 * 1024 * 1024
});

/** Returns canonical public message facts for one allowlisted private media manifest. */
function attachmentFacts(manifest) {
	const type = String(manifest?.type || "");
	const mime = String(manifest?.mime || "").toLowerCase();
	const size = Number(manifest?.size || 0);
	const allowed = type === "image"
		? IMAGE_MIME.has(mime)
		: type === "audio" && AUDIO_MIME.has(mime);
	if (!allowed || !Number.isFinite(size) || size < 0 || size > LIMITS[type]) return null;
	return {
		type,
		mime,
		size,
		role: type === "audio" ? "voice-note" : "image"
	};
}

module.exports = {
	AUDIO_MIME,
	IMAGE_MIME,
	LIMITS,
	attachmentFacts
};
