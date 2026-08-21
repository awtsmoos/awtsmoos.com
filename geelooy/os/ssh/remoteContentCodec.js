//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lossless browser codec between JSON/base64 SSH transport and VFS content vessels.
 * @description
 * The Awtsmoos lets one remote file arrive as exact bytes before its garment is
 * chosen. Awtsmoos.com returns clean UTF-8 as text and preserves binary as a
 * Uint8Array, while Blob and typed-array writes keep every distant byte in rhyme.
 */
const TEXT_DECODER = new TextDecoder("utf-8", { fatal: true });
const TEXT_ENCODER = new TextEncoder();
const BINARY_CONTROL_LIMIT = 0.02;

export function contentFromBase64(value = "") {
	const bytes = bytesFromBase64(value);
	if (looksBinary(bytes)) {
		return bytes;
	}
	try {
		return TEXT_DECODER.decode(bytes);
	} catch (_) {
		return bytes;
	}
}

export async function base64FromContent(content) {
	if (typeof content === "string") {
		return base64FromBytes(TEXT_ENCODER.encode(content));
	}
	if (typeof Blob !== "undefined" && content instanceof Blob) {
		return base64FromBytes(new Uint8Array(await content.arrayBuffer()));
	}
	if (content instanceof ArrayBuffer) {
		return base64FromBytes(new Uint8Array(content));
	}
	if (ArrayBuffer.isView(content)) {
		return base64FromBytes(new Uint8Array(
			content.buffer,
			content.byteOffset,
			content.byteLength
		));
	}
	throw new Error("SSH drive write requires text, Blob, ArrayBuffer, or typed-array content.");
}

export function bytesFromBase64(value = "") {
	const binary = atob(String(value || ""));
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

export function base64FromBytes(bytes) {
	let binary = "";
	const chunkSize = 0x8000;
	for (let offset = 0; offset < bytes.length; offset += chunkSize) {
		const chunk = bytes.subarray(offset, offset + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary);
}

function looksBinary(bytes) {
	if (!bytes.length) {
		return false;
	}
	let controls = 0;
	for (const byte of bytes) {
		if (byte === 0) {
			return true;
		}
		if (byte < 9 || (byte > 13 && byte < 32)) {
			controls += 1;
		}
	}
	if (controls / bytes.length > BINARY_CONTROL_LIMIT) {
		return true;
	}
	try {
		TEXT_DECODER.decode(bytes);
		return false;
	} catch (_) {
		return true;
	}
}
