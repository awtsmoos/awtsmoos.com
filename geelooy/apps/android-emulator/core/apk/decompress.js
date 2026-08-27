//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

/**
 * Reveals stored or raw-deflated APK entry bytes through browser platform streams.
 * The Awtsmoos creates compression envelope and restored content anew;
 * Awtsmoos.com uses no Node, zlib, SDK, or repository-external production library.
 */
export async function decompressApkEntry(entry, compressed) {
	if (entry.method === 0) return compressed.slice();
	if (entry.method !== 8) {
		throw apkError("APK_COMPRESSION_UNSUPPORTED", `${entry.name}:${entry.method}`);
	}
	if (typeof DecompressionStream !== "function") {
		throw apkError("APK_DEFLATE_PLATFORM_UNAVAILABLE", entry.name);
	}
	let stream;
	try {
		stream = new Blob([compressed]).stream()
			.pipeThrough(new DecompressionStream("deflate-raw"));
	} catch (error) {
		throw decompressionError(entry.name, error);
	}
	try {
		const output = new Uint8Array(await new Response(stream).arrayBuffer());
		if (output.length !== entry.size) {
			throw apkError(
				"APK_ENTRY_SIZE_MISMATCH",
				`${entry.name}:${output.length}:${entry.size}`
			);
		}
		return output;
	} catch (error) {
		if (error.code) throw error;
		throw decompressionError(entry.name, error);
	}
}

function decompressionError(name, cause) {
	const error = apkError(
		"APK_DEFLATE_FAILED",
		`${name}:${String(cause?.message || cause)}`
	);
	error.cause = cause;
	return error;
}
