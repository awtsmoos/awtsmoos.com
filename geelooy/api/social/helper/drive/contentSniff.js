//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module DriveContentSniff
 * @description
 * The Awtsmoos lets the bytes themselves testify to their kind. A stored mime
 * is only a claim made at write time — by a caller-supplied header or by the
 * file name's extension — and the media pipeline has proven that claim can be
 * false (JPEG and WebP and MP4 vessels all recorded as image/png). Under
 * X-Content-Type-Options: nosniff a false claim is fatal: the browser must
 * refuse the vessel. This module reads the magic bytes of the leading formats
 * and lets the serving path replace a disproven mime with the true one. Text
 * formats carry no magic and are never second-guessed here.
 */

/**
 * Leading-byte signatures whose formats are proven by their first bytes.
 * Each entry is matched at offset zero, in order, before the shaped checks.
 *
 * @type {Array<{mime: string, bytes?: number[], text?: string}>}
 */
const SIGNATURES = [
	{ mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
	{ mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
	{ mime: 'image/gif', text: 'GIF8' },
	{ mime: 'application/pdf', text: '%PDF' },
	{ mime: 'audio/mpeg', text: 'ID3' },
	{ mime: 'model/gltf-binary', text: 'glTF' },
	{ mime: 'font/woff', text: 'wOFF' },
	{ mime: 'font/woff2', text: 'wOF2' },
	{ mime: 'application/wasm', bytes: [0x00, 0x61, 0x73, 0x6D] },
	{ mime: 'video/webm', bytes: [0x1A, 0x45, 0xDF, 0xA3] },
	{ mime: 'application/zip', bytes: [0x50, 0x4B, 0x03, 0x04] }
];

/**
 * Tells whether the buffer carries the given latin1 text at the offset.
 *
 * @param {Buffer} buffer - The bytes under inspection.
 * @param {string} text - The expected signature text.
 * @param {number} offset - The byte offset the text must begin at.
 * @returns {boolean} True when every expected byte is present.
 */
function hasText(buffer, text, offset) {
	if (!Buffer.isBuffer(buffer) || buffer.length < offset + text.length) return false;
	return buffer.subarray(offset, offset + text.length).toString('latin1') === text;
}

/**
 * Tells whether the buffer begins with the given raw byte sequence.
 *
 * @param {Buffer} buffer - The bytes under inspection.
 * @param {number[]} bytes - The expected leading bytes.
 * @returns {boolean} True when the buffer starts with the sequence.
 */
function hasBytes(buffer, bytes) {
	if (!Buffer.isBuffer(buffer) || buffer.length < bytes.length) return false;
	return bytes.every((value, index) => buffer[index] === value);
}

/**
 * Proves a mime type from a buffer's magic bytes, or returns null when the
 * leading bytes prove nothing (text vessels, unknown formats, short reads).
 *
 * @param {Buffer} buffer - The full object bytes (only the head is read).
 * @returns {string|null} The byte-proven mime type, without parameters.
 */
function sniffMime(buffer) {
	if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;
	for (const signature of SIGNATURES) {
		if (signature.text && hasText(buffer, signature.text, 0)) return signature.mime;
		if (signature.bytes && hasBytes(buffer, signature.bytes)) return signature.mime;
	}
	if (hasText(buffer, 'RIFF', 0) && hasText(buffer, 'WEBP', 8)) return 'image/webp';
	if (hasText(buffer, 'ftyp', 4)) {
		const brand = buffer.subarray(8, 12).toString('latin1');
		if (brand === 'avif' || brand === 'avis') return 'image/avif';
		if (brand === 'qt  ') return 'video/quicktime';
		return 'video/mp4';
	}
	if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[3] === 0x00
		&& (buffer[2] === 0x01 || buffer[2] === 0x02)) return 'image/x-icon';
	if (buffer[0] === 0xFF && [0xFB, 0xF3, 0xF2].includes(buffer[1])) return 'audio/mpeg';
	return null;
}

/**
 * Resolves the mime a response must speak: the stored mime, unless the bytes
 * prove a different base type, in which case the byte-proven type wins. A
 * stored mime that already agrees keeps its full form, parameters included.
 *
 * @param {Buffer} buffer - The full object bytes about to be served.
 * @param {string} storedMime - The mime recorded on the drive entry.
 * @returns {string} The mime the response must declare.
 */
function effectiveMime(buffer, storedMime) {
	const stored = String(storedMime || '');
	const sniffed = sniffMime(buffer);
	if (!sniffed) return stored;
	const storedBase = stored.split(';')[0].trim().toLowerCase();
	return sniffed === storedBase ? stored : sniffed;
}

module.exports = {
	effectiveMime,
	sniffMime
};
