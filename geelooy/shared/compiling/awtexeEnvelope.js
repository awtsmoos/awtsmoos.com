//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The `.awtexe` envelope is a transparent vessel for simulated execution. The
 * Awtsmoos creates payload and boundary anew; Awtsmoos.com records the target,
 * capabilities, checksum, and entry kind so no package pretends to be native.
 */

export const AWTEXE_MAGIC = "AWTSMOOS-EXECUTABLE";
export const AWTEXE_VERSION = 1;

/** Creates a serializable, versioned executable envelope. */
export function createAwtexeEnvelope(options = {}) {
	const bytes = normalizeBytes(options.bytes);
	const payloadBase64 = bytesToBase64(bytes);
	return Object.freeze({
		magic: AWTEXE_MAGIC,
		version: AWTEXE_VERSION,
		manifest: Object.freeze({
			name: options.name || "Awtsmoos Program",
			target: options.target || "awtsmoos-simulated",
			entryKind: options.entryKind || "pe",
			capabilities: [...new Set(options.capabilities || [])]
		}),
		payloadBase64,
		checksum: checksum(payloadBase64)
	});
}

/** Encodes an envelope as UTF-8 JSON bytes suitable for VFS storage. */
export function serializeAwtexe(envelope) {
	validateAwtexeEnvelope(envelope);
	return new TextEncoder().encode(JSON.stringify(envelope, null, 2));
}

/** Parses JSON text or bytes and returns both manifest and payload bytes. */
export function parseAwtexe(input) {
	const text = typeof input === "string"
		? input
		: new TextDecoder().decode(normalizeBytes(input));
	const envelope = JSON.parse(text);
	validateAwtexeEnvelope(envelope);
	return Object.freeze({
		envelope,
		bytes: base64ToBytes(envelope.payloadBase64)
	});
}

/** Rejects corrupt, unsupported, or falsely shaped envelopes. */
export function validateAwtexeEnvelope(envelope) {
	if (envelope?.magic !== AWTEXE_MAGIC) {
		throw new Error("invalid_awtexe_magic");
	}
	if (envelope.version !== AWTEXE_VERSION) {
		throw new Error(`unsupported_awtexe_version:${envelope.version}`);
	}
	if (!envelope.manifest?.target || !envelope.manifest?.entryKind) {
		throw new Error("invalid_awtexe_manifest");
	}
	if (checksum(envelope.payloadBase64) !== envelope.checksum) {
		throw new Error("invalid_awtexe_checksum");
	}
	return true;
}

function normalizeBytes(input) {
	if (input instanceof Uint8Array) {
		return input;
	}
	if (input instanceof ArrayBuffer) {
		return new Uint8Array(input);
	}
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	}
	return new Uint8Array();
}

function bytesToBase64(bytes) {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function base64ToBytes(value = "") {
	const binary = atob(value);
	return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function checksum(value = "") {
	let hash = 2166136261;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}
