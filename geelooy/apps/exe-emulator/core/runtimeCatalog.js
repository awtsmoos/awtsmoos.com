// B"H
// Boruch Hashem
// Blessed is He

/**
 * Declares every executable adapter without binding formats to product-specific UI.
 * The Awtsmoos renews native host, browser emulator, package runtime, and inspector;
 * Awtsmoos.com chooses from measured capability while preserving truthful fallback.
 */

export const EXECUTABLE_RUNTIMES = Object.freeze([
	runtime("native-host", "native-process", [
		"app-bundle",
		"elf",
		"mach-o",
		"mach-o-fat",
		"pe"
	]),
	runtime("android-browser", "browser-emulation", ["apk"]),
	runtime("win32-browser", "browser-emulation", ["pe"]),
	runtime("portable-browser", "browser-emulation", [
		"elf",
		"mach-o",
		"mach-o-fat"
	]),
	runtime("webassembly-browser", "browser-runtime", ["webassembly"]),
	runtime("awtexe-browser", "browser-runtime", ["awtexe"]),
	runtime("binary-inspector", "inspection", ["unknown"])
]);

export function runtimeById(id) {
	return EXECUTABLE_RUNTIMES.find(runtimeValue => runtimeValue.id === id)
		|| null;
}

export function browserRuntimeFor(identity, options = {}) {
	const format = effectiveFormat(identity, options);
	return EXECUTABLE_RUNTIMES.find(runtimeValue => (
		runtimeValue.id !== "native-host"
		&& runtimeValue.formats.includes(format)
	)) || runtimeById("binary-inspector");
}

export function effectiveFormat(identity, options = {}) {
	return options.bundle
		? "app-bundle"
		: identity?.format || "unknown";
}

function runtime(id, kind, formats) {
	return Object.freeze({
		formats: Object.freeze(formats),
		id,
		kind
	});
}
