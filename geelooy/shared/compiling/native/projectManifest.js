//B"H
//Boruch Hashem
//Blessed is He

import { nativeBuildError } from "./errors.js";
import { NATIVE_LIMITS } from "./limits.js";
import {
	allowlistedManifestValues,
	enumManifestValue,
	safeManifestName,
	safeManifestOutputName,
	safeManifestPath,
	uniqueStrings
} from "./manifestPolicy.js";
import { nativeTarget } from "./targetTriples.js";

/**
 * A project manifest gathers scattered source into one accountable intention.
 * The Awtsmoos recreates source and destination together; Awtsmoos.com validates
 * every declared capability before any guarded compiler process may awaken.
 */

export const PROJECT_MANIFEST_VERSION = 1;

/** Normalizes the one versioned C/C++ manifest shared by editor and compiler. */
export function createProjectManifest(input = {}) {
	const target = nativeTarget(input.target || "macos-x64");
	const sourceFiles = normalizeSources(input.sourceFiles || input.sources || []);
	const manifest = {
		version: PROJECT_MANIFEST_VERSION,
		projectName: safeManifestName(input.projectName || "awtsmoos-project"),
		sourceFiles,
		includeDirectories: Object.freeze(uniqueStrings(input.includeDirectories).map(safeManifestPath)),
		languageStandard: enumManifestValue(input.languageStandard || inferStandard(sourceFiles), "languageStandard", "language standard"),
		target: target.id,
		platform: target.platform,
		architecture: target.architecture,
		outputType: input.outputType || target.outputType,
		entryPoint: String(input.entryPoint || "main"),
		buildMode: enumManifestValue(input.buildMode || "debug", "buildMode", "build mode"),
		optimization: enumManifestValue(String(input.optimization ?? "0"), "optimization"),
		runtimeCapabilities: Object.freeze(uniqueStrings(input.runtimeCapabilities)),
		externalLibraries: Object.freeze(uniqueStrings(input.externalLibraries)),
		linkerFlags: allowlistedManifestValues(input.linkerFlags, "linkerFlags", "linker flag"),
		outputFilename: safeManifestOutputName(input.outputFilename || defaultOutputName(input.projectName, target)),
		packagingPreference: enumManifestValue(input.packagingPreference || "artifact", "packagingPreference", "packaging preference"),
		signingPreference: enumManifestValue(input.signingPreference || "none", "signingPreference", "signing preference"),
		emulatorPreference: enumManifestValue(input.emulatorPreference || "auto", "emulatorPreference", "emulator preference")
	};
	validateSourceBytes(manifest.sourceFiles);
	return Object.freeze(manifest);
}

function normalizeSources(sources) {
	if (!Array.isArray(sources) || sources.length === 0) {
		throw nativeBuildError("SOURCE_REQUIRED", "At least one C or C++ source file is required.", {
			stage: "manifest"
		});
	}
	if (sources.length > NATIVE_LIMITS.sourceFileCount) {
		throw nativeBuildError("SOURCE_FILE_COUNT_LIMIT", "Too many source files.", {
			stage: "manifest"
		});
	}
	return Object.freeze(sources.map((source, index) => Object.freeze({
		path: safeManifestPath(source.path || source.name || `source-${index}.c`),
		content: String(source.content ?? "")
	})));
}

function validateSourceBytes(sources) {
	const bytes = sources.reduce((total, source) => (
		total + new TextEncoder().encode(source.content).length
	), 0);
	if (bytes > NATIVE_LIMITS.sourceBytes) {
		throw nativeBuildError("SOURCE_BYTES_LIMIT", "Source content exceeds the configured byte limit.", {
			stage: "manifest"
		});
	}
}

function inferStandard(sources) {
	return sources.some(source => /\.(cc|cpp|cxx)$/i.test(source.path))
		? "c++20"
		: "c17";
}

function defaultOutputName(projectName, target) {
	const extension = target.format === "pe"
		? ".exe"
		: target.format === "webassembly"
			? ".wasm"
			: target.format === "awtexe"
				? ".awtexe"
				: "";
	return `${safeManifestName(projectName || "awtsmoos-program")}${extension}`;
}
