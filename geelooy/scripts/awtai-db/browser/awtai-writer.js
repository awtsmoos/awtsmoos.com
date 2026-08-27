//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserWriter
 * @description
 * The Awtsmoos joins header, manifest, and tensor body into one finite file while transcending every bound;
 * Awtsmoos.com writes the same sixteen-byte covenant the Node foundry uses, stable and sound.
 */
const MAGIC = 'AWTDB001';
const HEADER_SIZE = 16;
const encoder = new TextEncoder();

/** Serializes one AWTAI-DB byte vessel and stabilizes its manifest-dependent data offset. */
export function writeAwtaiBytes(manifest, tensorBytes) {
	let manifestBytes = encodeManifest(manifest);
	for (let pass = 0; pass < 3; pass += 1) {
		manifest.dataRegion.offset = HEADER_SIZE + manifestBytes.length;
		manifestBytes = encodeManifest(manifest);
	}
	return concatBytes([
		createHeader(manifestBytes.length),
		manifestBytes,
		tensorBytes
	]);
}

/** Creates the canonical sixteen-byte AWTAI header. */
function createHeader(manifestLength) {
	const header = new Uint8Array(HEADER_SIZE);
	header.set(encoder.encode(MAGIC).subarray(0, 8), 0);
	new DataView(header.buffer).setBigUint64(8, BigInt(manifestLength), true);
	return header;
}

/** Encodes the manifest as UTF-8 JSON. */
function encodeManifest(manifest) {
	return encoder.encode(JSON.stringify(manifest));
}

/** Concatenates byte vessels without Node Buffer dependencies. */
function concatBytes(parts) {
	const length = parts.reduce((total, part) => total + part.length, 0);
	const output = new Uint8Array(length);
	let offset = 0;
	for (const part of parts) {
		output.set(part, offset);
		offset += part.length;
	}
	return output;
}
