// B"H
// Boruch Hashem
// Blessed is He

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compilePortableCLibrary, compilePortableCLibrarySet } from "../../native/c/library.js";

/**
 * Awtsmoos Android NDK-ABI compile doorway. Compiles C sources against the
 * clean-room Awtsmoos-owned ABI headers in native/runtime/include/android/
 * into real AArch64 shared objects — zero NDK, 100% Awtsmoos code.
 *
 * Sources may `#include <android/native_activity.h>` (and the other headers
 * in that directory); the headers are injected into the preprocessor as
 * extra headers, so the on-disk include tree is the single source of truth.
 *
 * The portable backend emits a real ET_DYN/AArch64 .so; EGL/GLES/Android
 * entry points declared in the headers become dynamic imports resolved by
 * the Android linker at load time.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const INCLUDE_DIR = join(HERE, "../../native/runtime/include/android");

const ANDROID_HEADERS = Object.freeze({
	"android/native_activity.h": "native_activity.h",
	"android/native_window.h": "native_window.h",
	"android/egl.h": "egl.h",
	"android/gles.h": "gles.h",
	"android/input.h": "input.h",
	"android/configuration.h": "configuration.h",
	"android/bitmap.h": "bitmap.h",
	"android/log.h": "log.h"
});

let cachedHeaders = null;

/** Reads the Awtsmoos Android ABI headers once; returns name->content. */
export function loadAndroidAbiHeaders() {
	if (cachedHeaders) return cachedHeaders;
	const map = {};
	for (const [includeName, fileName] of Object.entries(ANDROID_HEADERS)) {
		map[includeName] = readFileSync(join(INCLUDE_DIR, fileName), "utf8");
	}
	cachedHeaders = Object.freeze(map);
	return cachedHeaders;
}

/**
 * Compiles one C source into an Android ABI shared library.
 *
 * @param {string} sourceText C source (may include <android/*.h>).
 * @param {object} options { soname, needed, ... } passed to compilePortableCLibrary.
 * @returns {object} { bytes, evidence, ... } — real ET_DYN AArch64 .so bytes.
 */
export function compileAndroidAbiLibrary(sourceText, options = {}) {
	const headers = loadAndroidAbiHeaders();
	const preprocessOptions = { headers };
	const merged = { ...options, preprocessOptions };
	return compilePortableCLibrary(sourceText, merged);
}

/**
 * Compiles several C sources (one .so) against the Android ABI headers.
 */
export function compileAndroidAbiLibrarySet(sources, options = {}) {
	const headers = loadAndroidAbiHeaders();
	const merged = { ...options, preprocessOptions: { headers } };
	return compilePortableCLibrarySet(sources, merged);
}
