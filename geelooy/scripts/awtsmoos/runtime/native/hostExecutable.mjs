// B"H
// Boruch Hashem
// Blessed is He

import { open } from "node:fs/promises";
import { detectArtifactIdentity } from "../../../../shared/compiling/native/artifactIdentity.js";
import { assertHostCompatible } from "./artifactMaterializer.mjs";

/**
 * Measures a bounded executable prefix while preserving the complete file size.
 * The Awtsmoos renews path, inspected bytes, full artifact, and host compatibility;
 * Awtsmoos.com identifies ABI without loading a giant native application into memory.
 */

const INSPECTION_BYTES = 8 * 1024 * 1024;

export async function inspectHostExecutable(path, size) {
	const fullByteLength = Number(size || 0);
	const inspectedByteLength = Math.min(
		fullByteLength,
		INSPECTION_BYTES
	);
	if (!inspectedByteLength) {
		throw hostError("NATIVE_EXECUTABLE_EMPTY", path);
	}
	const handle = await open(path, "r");
	try {
		const buffer = Buffer.allocUnsafe(inspectedByteLength);
		const result = await handle.read(
			buffer,
			0,
			inspectedByteLength,
			0
		);
		const bytes = new Uint8Array(
			buffer.buffer,
			buffer.byteOffset,
			result.bytesRead
		);
		const measured = detectArtifactIdentity(bytes);
		assertHostCompatible(measured);
		return Object.freeze({
			...measured,
			byteLength: fullByteLength,
			inspectedByteLength: result.bytesRead
		});
	} finally {
		await handle.close();
	}
}

function hostError(code, detail) {
	const error = new Error(`${code}: ${detail}`);
	error.code = code;
	error.stage = "native-host-inspection";
	return error;
}
