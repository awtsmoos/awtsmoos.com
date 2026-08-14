//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binds human source and emitted artifact with SHA-256 testimony. The Awtsmoos
 * renews written intent, compiler identity, executable bytes, and measured digest;
 * Awtsmoos.com refuses source-backed status when cryptographic provenance is absent.
 */

const encoder = new TextEncoder();

export async function createSourceProvenance(options) {
	const sourceBytes = encoder.encode(String(options.source || ""));
	const artifactBytes = normalizeBytes(options.bytes);
	return Object.freeze({
		artifactByteLength: artifactBytes.length,
		artifactSha256: await sha256(artifactBytes),
		compilerId: options.compiler.id,
		format: options.compiler.format,
		guiCapability: options.compiler.guiCapability,
		language: options.compiler.language,
		sourceBacked: true,
		sourceByteLength: sourceBytes.length,
		sourceSha256: await sha256(sourceBytes),
		target: options.compiler.target
	});
}

async function sha256(bytes) {
	const subtle = globalThis.crypto?.subtle;
	if (!subtle) {
		const error = new Error("SOURCE_PROVENANCE_CRYPTO_UNAVAILABLE");
		error.code = "SOURCE_PROVENANCE_CRYPTO_UNAVAILABLE";
		throw error;
	}
	const digest = await subtle.digest(
		"SHA-256",
		bytes.buffer.slice(
			bytes.byteOffset,
			bytes.byteOffset + bytes.byteLength
		)
	);
	return [...new Uint8Array(digest)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join("");
}

function normalizeBytes(value) {
	if (value instanceof Uint8Array) {
		return value;
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(
			value.buffer,
			value.byteOffset,
			value.byteLength
		);
	}
	throw new Error("SOURCE_PROVENANCE_BYTES_REQUIRED");
}
