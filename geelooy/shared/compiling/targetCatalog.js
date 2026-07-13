//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_TARGETS,
	describeNativeTargets,
	nativeTarget
} from "./native/targetTriples.js";

/**
 * The catalog separates artifact identity from backend availability. The
 * Awtsmoos creates possibility and present capability together; Awtsmoos.com
 * shows unavailable targets without fabricating bytes or renaming simulation.
 */

const DEFAULT_CAPABILITIES = Object.freeze({
	"awtsmoos-simulated": true,
	"browser-pe-generator": true
});

const LEGACY_BROWSER_PE = Object.freeze({
	id: "windows-x64-pe",
	label: "Windows x86_64 PE (legacy browser generator)",
	platform: "windows",
	architecture: "x86_64",
	format: "pe",
	triple: "x86_64-w64-windows-gnu",
	outputType: "executable",
	subsystem: "selected-by-mode",
	backend: "browser-pe-generator",
	available: true,
	nativeBackend: false,
	executionClass: "browser-generated-native-image",
	reason: "legacy_subset_generator_not_a_system_c_cpp_toolchain",
	extension: ".exe"
});

export const COMPILER_TARGETS = Object.freeze(Object.fromEntries([
	LEGACY_BROWSER_PE,
	...describeNativeTargets(DEFAULT_CAPABILITIES).map(target => decorate(target))
].map(target => [target.id, target])));

/** Returns one target description with optional observed capabilities. */
export function describeCompilerTarget(id, capabilities = DEFAULT_CAPABILITIES) {
	if (id === LEGACY_BROWSER_PE.id) {
		return LEGACY_BROWSER_PE;
	}
	const target = nativeTarget(id);
	return decorate(describeNativeTargets(capabilities).find(item => item.id === target.id));
}

/** Lists exact target identities and honest availability reasons. */
export function listCompilerTargets(capabilities = DEFAULT_CAPABILITIES) {
	return Object.freeze([
		LEGACY_BROWSER_PE,
		...describeNativeTargets(capabilities).map(target => decorate(target))
	]);
}

function decorate(target) {
	const extension = extensionFor(target);
	return Object.freeze({
		...target,
		nativeBackend: target.format !== "awtexe" && target.available,
		executionClass: executionClass(target),
		extension
	});
}

function executionClass(target) {
	if (target.format === "awtexe") {
		return "simulated";
	}
	if (target.format === "webassembly") {
		return "webassembly";
	}
	return target.available ? "native" : "unavailable";
}

function extensionFor(target) {
	if (target.format === "pe") {
		return target.outputType === "shared-library" ? ".dll" : ".exe";
	}
	if (target.format === "webassembly") {
		return ".wasm";
	}
	if (target.format === "awtexe") {
		return ".awtexe";
	}
	if (target.format === "app-bundle") {
		return ".app";
	}
	return "";
}

export default COMPILER_TARGETS;
