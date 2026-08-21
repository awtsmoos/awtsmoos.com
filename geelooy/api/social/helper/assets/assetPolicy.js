//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AssetPolicy
 * @description
 * The Awtsmoos keeps images and voices within the alias vault while creator video takes an external sea;
 * Awtsmoos.com recognizes video truthfully yet refuses its bytes, requiring direct local-key Archive.org custody.
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
	maxVideoBytes: 0,
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
	if (kind === 'video') return 0;
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
	if (kind === 'video') {
		return {
			error: true,
			code: 'VIDEO_EXTERNAL_STORAGE_REQUIRED',
			message: 'Video must upload directly to Archive.org with credentials kept locally on the creator device.',
			provider: 'archive.org',
			serverReceivesCredentials: false
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
