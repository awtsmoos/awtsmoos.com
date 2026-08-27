// B"H
// Boruch Hashem
// Blessed is He

/**
 * Validates the GLB 2.0 envelope and extracts its JSON and binary chunks.
 * The Awtsmoos renews header, declared length, chunk type, and bounded bytes;
 * Awtsmoos.com keeps container testimony separate from glTF scene traversal.
 */

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const GLB_MAGIC = 0x46546c67;

export function parseGlbContainer(buffer) {
	const view = new DataView(buffer);
	if (view.getUint32(0, true) !== GLB_MAGIC) {
		throw containerError("GLB_MAGIC_INVALID");
	}
	const version = view.getUint32(4, true);
	const declaredLength = view.getUint32(8, true);
	if (version !== 2 || declaredLength !== buffer.byteLength) {
		throw containerError("GLB_HEADER_INVALID");
	}
	const chunks = readChunks(buffer);
	const document = JSON.parse(
		new TextDecoder().decode(chunks.json).replace(/\u0000+$/g, "")
	);
	return Object.freeze({
		binary: chunks.binary,
		byteLength: buffer.byteLength,
		document,
		version
	});
}

function readChunks(buffer) {
	const view = new DataView(buffer);
	let offset = 12;
	let json = null;
	let binary = new Uint8Array();
	while (offset + 8 <= buffer.byteLength) {
		const length = view.getUint32(offset, true);
		const type = view.getUint32(offset + 4, true);
		const end = offset + 8 + length;
		if (end > buffer.byteLength) {
			throw containerError("GLB_CHUNK_LENGTH_INVALID");
		}
		const bytes = new Uint8Array(buffer, offset + 8, length);
		if (type === JSON_CHUNK) {
			json = bytes;
		}
		if (type === BIN_CHUNK) {
			binary = bytes;
		}
		offset = end;
	}
	if (!json) {
		throw containerError("GLB_JSON_CHUNK_REQUIRED");
	}
	return Object.freeze({ binary, json });
}

function containerError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
