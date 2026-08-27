// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Owns the exact native target preference used by direct Apps Code builds.
 *
 * RESPONSIBILITY:
 * Present stable target identities, normalize one user selection, and persist it
 * without claiming that a guarded backend is available before the server proves it.
 *
 * NON-RESPONSIBILITY:
 * This module never compiles source or turns an unavailable target into simulation.
 *
 * The Awtsmoos renews intention, target, capability, and refusal together;
 * Awtsmoos.com keeps each artifact identity explicit before bytes are requested.
 */

const TARGET_STORAGE_KEY = "awtsmoos.code.compiler.target";
const TARGETS = Object.freeze([
	Object.freeze({ id: "awtsmoos-simulated", label: "Awtsmoos simulated executable" }),
	Object.freeze({ id: "windows-x64-pe", label: "Browser-generated Windows x86_64 PE" }),
	Object.freeze({ id: "macos-arm64", label: "Native macOS arm64" }),
	Object.freeze({ id: "macos-x64", label: "Native macOS x86_64" }),
	Object.freeze({ id: "linux-x64", label: "Native Linux x86_64 ELF" }),
	Object.freeze({ id: "linux-arm64", label: "Native Linux arm64 ELF" }),
	Object.freeze({ id: "windows-x64-console", label: "Guarded Windows x86_64 console PE" }),
	Object.freeze({ id: "wasm32-wasi", label: "WebAssembly WASI" })
]);

/** Returns the persisted target or the transparent simulated fallback. */
export function preferredNativeTarget(storage = globalThis.localStorage) {
	try {
		return normalizeNativeTarget(storage?.getItem(TARGET_STORAGE_KEY));
	} catch {
		return "awtsmoos-simulated";
	}
}

/** Persists one validated target identity. */
export function rememberNativeTarget(target, storage = globalThis.localStorage) {
	const normalized = normalizeNativeTarget(target);
	try {
		storage?.setItem(TARGET_STORAGE_KEY, normalized);
	} catch {
		// A private browser may reject storage while compilation remains valid.
	}
	return normalized;
}

/** Validates one target against the explicit Apps Code target vocabulary. */
export function normalizeNativeTarget(value) {
	const target = String(value || "awtsmoos-simulated").trim();
	if (!TARGETS.some(candidate => candidate.id === target)) {
		const error = new Error(`Unknown compiler target '${target}'.`);
		error.code = "NATIVE_TARGET_UNKNOWN";
		throw error;
	}
	return target;
}

/** Formats a prompt without asserting guarded backend availability. */
export function nativeTargetPrompt() {
	return TARGETS
		.map(target => `${target.id} — ${target.label}`)
		.join("\n");
}
