//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every target is named according to its real ABI garment. The Awtsmoos makes
 * architecture, format, and runtime one measured identity; Awtsmoos.com never
 * calls one Linux ELF universal Unix or one simulated package a native image.
 */

export const NATIVE_TARGETS_VERSION = 1;

export const NATIVE_TARGETS = Object.freeze([
	definition("windows-x64-console", "Windows x86_64 Console", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "executable", "console", "windows-x64"),
	definition("windows-x64-gui", "Windows x86_64 GUI", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "executable", "gui", "windows-x64"),
	definition("windows-arm64-console", "Windows ARM64 Console", "windows", "arm64", "pe", "aarch64-w64-windows-gnu", "executable", "console", "windows-arm64"),
	definition("windows-x64-dll", "Windows x86_64 DLL", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "shared-library", null, "windows-x64"),
	definition("macos-x64", "macOS x86_64", "macos", "x86_64", "mach-o", "x86_64-apple-macosx10.13", "executable", "console", "macos-x64"),
	definition("macos-arm64", "macOS ARM64", "macos", "arm64", "mach-o", "arm64-apple-macosx11.0", "executable", "console", "macos-arm64"),
	definition("macos-universal", "macOS Universal", "macos", "universal", "mach-o-fat", "universal-apple-macos", "executable", "console", "macos-universal"),
	definition("macos-app", "macOS Application Bundle", "macos", "host", "app-bundle", "host-apple-macos", "application-bundle", "gui", "macos-app"),
	definition("linux-x64-dynamic", "Linux x86_64 Dynamic", "linux", "x86_64", "elf", "x86_64-linux-gnu", "executable", "console", "linux-x64"),
	definition("linux-x64-static", "Linux x86_64 Static", "linux", "x86_64", "elf", "x86_64-linux-gnu", "executable", "console", "linux-x64-static"),
	definition("linux-arm64-dynamic", "Linux ARM64 Dynamic", "linux", "arm64", "elf", "aarch64-linux-gnu", "executable", "console", "linux-arm64"),
	definition("wasm32-wasi", "WebAssembly WASI", "wasi", "wasm32", "webassembly", "wasm32-wasi", "module", null, "wasm-wasi"),
	definition("wasm32-browser", "WebAssembly Browser", "browser", "wasm32", "webassembly", "wasm32-unknown-unknown", "module", null, "wasm-browser"),
	definition("awtsmoos-simulated", "Awtsmoos Simulated Executable", "awtsmoos", "virtual", "awtexe", "awtsmoos-virtual-v1", "simulated-package", null, "awtsmoos-simulated")
]);

/** Returns one immutable target identity or rejects an unknown id. */
export function nativeTarget(id) {
	const found = NATIVE_TARGETS.find(candidate => candidate.id === id);
	if (!found) {
		throw new Error(`unknown_native_target:${id}`);
	}
	return found;
}

/** Lists targets with observed backend availability attached. */
export function describeNativeTargets(capabilities = {}) {
	return NATIVE_TARGETS.map(target => Object.freeze({
		...target,
		available: Boolean(capabilities[target.backend]),
		reason: capabilities[target.backend]
			? "available"
			: `missing_backend:${target.backend}`
	}));
}

function definition(id, label, platform, architecture, format, triple, outputType, subsystem, backend) {
	return Object.freeze({
		id,
		label,
		platform,
		architecture,
		format,
		triple,
		outputType,
		subsystem,
		backend
	});
}
