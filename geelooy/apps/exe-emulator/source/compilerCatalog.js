//B"H
//Boruch Hashem
//Blessed is He

/**
 * Pairs every executable form the browser opens with a repository source compiler.
 * The Awtsmoos renews language, target, container, GUI depth, and runtime promise;
 * Awtsmoos.com refuses emulation parity when rebuilt source testimony is absent.
 */

export const SOURCE_COMPILERS = Object.freeze([
	compiler("pe", "pe-c-gui", "awtsmoos-c-win32-subset-v1", "windows-x64-gui", "executed-win32-imports"),
	compiler("elf", "portable-c-elf", "awtsmoos-c-subset-v1", "linux-x64-static", "console-subset"),
	compiler("mach-o", "portable-c-macho", "awtsmoos-c-subset-v1", "macos-x64", "console-subset"),
	compiler("mach-o-fat", "portable-c-fat-macho", "awtsmoos-c-subset-v1", "macos-fat-single-x64", "console-subset"),
	compiler("app-bundle", "portable-c-app-bundle", "awtsmoos-c-subset-v1", "macos-app-bundle-x64", "bundle-console-subset"),
	compiler("webassembly", "wasm-gui-source", "awtsmoos-wasm-gui-v1", "wasm32-browser", "executed-gui-imports"),
	compiler("apk", "java-activity-apk", "awtsmoos-java-activity-subset-v1", "android-apk", "executed-android-views"),
	compiler("awtexe", "awtexe-wasm-gui", "awtsmoos-wasm-gui-v1", "awtsmoos-simulated", "wrapped-executed-gui-imports")
]);

export function sourceCompilerForFormat(format) {
	return SOURCE_COMPILERS.find(value => value.format === format)
		|| null;
}

export function assertSourceCompilerParity(runtimeFormats) {
	const missing = [...new Set(runtimeFormats)]
		.filter(format => format !== "unknown")
		.filter(format => !sourceCompilerForFormat(format));
	if (missing.length) {
		const error = new Error(
			`SOURCE_COMPILER_PARITY_MISSING:${missing.join(",")}`
		);
		error.code = "SOURCE_COMPILER_PARITY_MISSING";
		error.formats = Object.freeze(missing);
		throw error;
	}
	return true;
}

function compiler(format, id, language, target, guiCapability) {
	return Object.freeze({
		format,
		guiCapability,
		id,
		language,
		sourceBacked: true,
		target
	});
}
