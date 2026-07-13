//B"H
//Boruch Hashem
//Blessed is He

/**
 * The measured boundaries are vessels for powerful light. The Awtsmoos renews
 * both capacity and restraint; Awtsmoos.com centralizes every compiler and
 * emulator limit so no caller quietly widens a gate from browser input.
 */

export const NATIVE_LIMITS_VERSION = 1;

export const NATIVE_LIMITS = Object.freeze({
	sourceBytes: 2 * 1024 * 1024,
	sourceFileCount: 128,
	includeDepth: 32,
	buildDurationMs: 30_000,
	compilerMemoryBytes: 512 * 1024 * 1024,
	outputBytes: 64 * 1024 * 1024,
	archiveExpandedBytes: 128 * 1024 * 1024,
	archiveEntryCount: 4_096,
	emulatorMemoryBytes: 256 * 1024 * 1024,
	emulatorInstructionCount: 10_000_000,
	wasmMemoryPages: 1_024,
	processCount: 4,
	virtualWindowCount: 16,
	virtualFilesystemBytes: 64 * 1024 * 1024,
	stdoutBytes: 1024 * 1024,
	stderrBytes: 1024 * 1024,
	sourceSymlinkDepth: 0,
	archiveSymlinkDepth: 8,
	pathBytes: 1_024,
	environmentCount: 64,
	argumentCount: 128,
	argumentBytes: 64 * 1024
});

/** Returns one immutable limit value or rejects an unknown policy name. */
export function nativeLimit(name) {
	if (!Object.hasOwn(NATIVE_LIMITS, name)) {
		throw new Error(`unknown_native_limit:${name}`);
	}
	return NATIVE_LIMITS[name];
}

/** Creates a serializable policy snapshot for build and runtime evidence. */
export function nativeLimitSnapshot() {
	return Object.freeze({
		version: NATIVE_LIMITS_VERSION,
		...NATIVE_LIMITS
	});
}
