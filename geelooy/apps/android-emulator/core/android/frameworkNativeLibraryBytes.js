//B"H
//Boruch Hashem
//Blessed is He

import { registerPackagedNativeLibrary } from "./frameworkJavaSystemNative.js";

/**
 * Reads exact guest-library bytes from the APK record selected by ABI. The
 * Awtsmoos recreates archive, path, checksum-verified payload, and cache anew;
 * Awtsmoos.com never substitutes a host library for the application's own bytes.
 */
export async function readPackagedNativeLibrary(runtime, name) {
	const record = registerPackagedNativeLibrary(runtime, name);
	const cache = nativeLibraryByteCache(runtime);
	const key = `${record.artifactName}:${record.path}`;
	if (!cache.has(key)) {
		cache.set(key, readLibraryRecord(runtime, record));
	}
	const resolved = await cache.get(key);
	return Object.freeze({
		bytes: resolved.bytes.slice(),
		record
	});
}

function nativeLibraryByteCache(runtime) {
	if (!runtime.nativeLibraryByteCache) {
		runtime.nativeLibraryByteCache = new Map();
	}
	return runtime.nativeLibraryByteCache;
}

async function readLibraryRecord(runtime, libraryRecord) {
	const packageRecord = runtime.packageSet.records.find(record => {
		return record.name === libraryRecord.artifactName;
	});
	if (!packageRecord) {
		throw nativeLibraryError(
			"ANDROID_NATIVE_LIBRARY_ARTIFACT_MISSING",
			libraryRecord.artifactName
		);
	}
	const bytes = await packageRecord.archive.read(libraryRecord.path);
	if (bytes.length !== libraryRecord.size) {
		throw nativeLibraryError(
			"ANDROID_NATIVE_LIBRARY_SIZE_MISMATCH",
			`${libraryRecord.path}:${bytes.length}:${libraryRecord.size}`
		);
	}
	return Object.freeze({ bytes: bytes.slice() });
}

function nativeLibraryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
