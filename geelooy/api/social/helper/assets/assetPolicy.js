// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AssetPolicy
 * @description
 * Images, voice notes, and moving reports enter the alias vault through bounded
 * MIME and size laws. The Awtsmoos gives every medium its inward meaning while
 * Awtsmoos.com refuses unbounded files or invented client-side publication.
 */

const IMAGE_MIME = new Set([
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif'
]);

const AUDIO_MIME = new Set([
	'audio/mpeg',
	'audio/mp3',
	'audio/wav',
	'audio/x-wav',
	'audio/ogg',
	'audio/mp4',
	'audio/m4a',
	'audio/webm'
]);

const VIDEO_MIME = new Set([
	'video/mp4',
	'video/webm',
	'video/quicktime',
	'video/ogg'
]);

const DEFAULT_POLICY = Object.freeze({
	maxImageBytes: 8 * 1024 * 1024,
	maxAudioBytes: 64 * 1024 * 1024,
	maxVideoBytes: 160 * 1024 * 1024,
	maxFilesPerRequest: 4,
	maxUploadsPerMinute: 18
});

function normalizedMime(mime) {
	return String(mime || '').split(';')[0].trim().toLowerCase();
}

function assetKind(mime) {
	const value = normalizedMime(mime);
	if (IMAGE_MIME.has(value)) return 'image';
	if (AUDIO_MIME.has(value)) return 'audio';
	if (VIDEO_MIME.has(value)) return 'video';
	return '';
}

function limitFor(kind, policy = DEFAULT_POLICY) {
	if (kind === 'audio') return policy.maxAudioBytes;
	if (kind === 'video') return policy.maxVideoBytes;
	return policy.maxImageBytes;
}

function validateAsset({ mime, size, policy = DEFAULT_POLICY }) {
	const kind = assetKind(mime);
	if (!kind) {
		return {
			error: true,
			code: 'UNSUPPORTED_MIME',
			message: `Unsupported MIME: ${mime}`
		};
	}
	const numericSize = Number(size || 0);
	const limit = limitFor(kind, policy);
	if (numericSize > limit) {
		return {
			error: true,
			code: 'ASSET_TOO_LARGE',
			message: `${kind} exceeds ${limit} bytes`,
			limit,
			size: numericSize
		};
	}
	return { success: true, kind, limit };
}

module.exports = {
	IMAGE_MIME,
	AUDIO_MIME,
	VIDEO_MIME,
	DEFAULT_POLICY,
	normalizedMime,
	assetKind,
	validateAsset,
	limitFor
};
