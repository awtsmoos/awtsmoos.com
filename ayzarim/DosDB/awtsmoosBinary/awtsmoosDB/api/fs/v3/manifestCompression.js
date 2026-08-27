// B"H

/**
 * @file manifestCompression.js
 * @chapter The Map Folds And Unfolds Under One Measured Seal
 * @description
 * Compresses FS3 manifest JSON only when the smaller physical body is worthwhile.
 * Decoding validates codec and original length before returning one trusted buffer.
 */

const zlib = require('zlib');

const CODEC = 'deflate-raw-v1';
const MINIMUM_SAVINGS = 64;

function encodeManifestBytes(db, bytes) {
	if (db.options?.virtualFsCompression === false) return { stored: bytes };
	const compressed = zlib.deflateRawSync(bytes, { level: 6 });
	return compressed.length + MINIMUM_SAVINGS < bytes.length
		? { stored: compressed, codec: CODEC }
		: { stored: bytes };
}

function decodeManifestBytes(db, token, blob) {
	const length = Number(token.storedBytes || blob.length || token.bytes || 0);
	const stored = db.blob.read(blob, 0, length);
	if (!token.codec) return stored;
	if (token.codec !== CODEC) {
		const error = new Error(`B"H unsupported FS3 manifest codec: ${token.codec}`);
		error.code = 'AWTSMOOS_FS3_UNSUPPORTED_MANIFEST_CODEC';
		throw error;
	}
	const output = zlib.inflateRawSync(stored);
	if (output.length !== Number(token.bytes || output.length)) {
		const error = new Error('B"H compressed FS3 manifest length mismatch');
		error.code = 'AWTSMOOS_FS3_MANIFEST_LENGTH_MISMATCH';
		throw error;
	}
	return output;
}

module.exports = {
	CODEC,
	decodeManifestBytes,
	encodeManifestBytes
};