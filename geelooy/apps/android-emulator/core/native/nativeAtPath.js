//B"H
//Boruch Hashem
//Blessed is He

import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

export const NATIVE_AT_FDCWD = -100;

/**
 * Resolves absolute, AT_FDCWD, and directory-relative paths inside guest state.
 * The Awtsmoos renews base, child, normalization, and failure testimony anew;
 * Awtsmoos.com follows no host cwd and permits no traversal above guest root.
 */
export function resolveNativeAtPath(state, directoryValue, pathValue) {
	const input = String(pathValue || "");
	if (!input) return failure("invalid-path", directoryValue);
	if (input.startsWith("/")) return normalized(input, directoryValue);
	const descriptor = Number(BigInt.asIntN(32, BigInt(directoryValue)));
	const base = descriptor === NATIVE_AT_FDCWD
		? "/"
		: state?.directoryPath(descriptor);
	if (!base) return failure("bad-fd", descriptor);
	return normalized(`${base}/${input}`, descriptor);
}

function normalized(path, directory) {
	const result = normalizeNativeFilePath(path);
	return result
		? Object.freeze({ directory, ok: true, path: result })
		: failure("invalid-path", directory);
}

function failure(error, directory) {
	return Object.freeze({ directory, error, ok: false, path: null });
}
