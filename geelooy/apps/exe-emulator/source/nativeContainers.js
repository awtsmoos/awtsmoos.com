//B"H
//Boruch Hashem
//Blessed is He

import { compilePortableCProgram } from "../../../scripts/awtsmoos/compiling/native/c/compiler.js";
import { buildFatMachO } from "../../../scripts/awtsmoos/compiling/native/fatMachO.js";

/**
 * Builds source-backed macOS containers around a measured thin Mach-O executable.
 * The Awtsmoos renews source slice, fat table, bundle metadata, and loaded bytes;
 * Awtsmoos.com labels one slice honestly and invents neither arm64 nor universality.
 */

export async function compileFatMachOSource(source) {
	const thin = await compilePortableCProgram(
		source,
		"macos-x64"
	);
	const fat = buildFatMachO([
		Object.freeze({
			architecture: "x86_64",
			bytes: thin.bytes
		})
	]);
	return Object.freeze({
		backend: `${thin.backend}+fat-container-v1`,
		bytes: fat.bytes,
		classification: fat.classification,
		extension: ".macho"
	});
}

export async function compileAppBundleSource(source, options = {}) {
	const executableName = safeExecutableName(
		options.executableName || "SourceMain"
	);
	const thin = await compilePortableCProgram(
		source,
		"macos-x64"
	);
	const executablePath = `Contents/MacOS/${executableName}`;
	const metadata = Object.freeze({
		CFBundleExecutable: executableName,
		CFBundleIdentifier: safeIdentifier(
			options.identifier || "com.awtsmoos.sourcebundle"
		),
		CFBundleName: String(options.label || "Source Application"),
		CFBundleShortVersionString: "1.0"
	});
	return Object.freeze({
		backend: `${thin.backend}+app-bundle-v1`,
		bundle: Object.freeze({
			fileCount: 2,
			files: new Map([
				[executablePath, Uint8Array.from(thin.bytes)]
			]),
			metadata,
			name: metadata.CFBundleName,
			rootPath: `/${metadata.CFBundleName.replace(/\s+/g, "")}.app`
		}),
		bytes: Uint8Array.from(thin.bytes),
		extension: ".app"
	});
}

function safeExecutableName(value) {
	const name = String(value || "SourceMain")
		.replace(/[^a-z0-9_-]+/gi, "_");
	if (!name || name === "." || name === "..") {
		throw containerError("SOURCE_BUNDLE_EXECUTABLE_NAME");
	}
	return name;
}

function safeIdentifier(value) {
	const identifier = String(value || "")
		.toLowerCase()
		.replace(/[^a-z0-9.-]+/g, "-");
	if (!/^[a-z0-9]+(?:[.-][a-z0-9-]+)+$/.test(identifier)) {
		throw containerError("SOURCE_BUNDLE_IDENTIFIER");
	}
	return identifier;
}

function containerError(code) {
	const error = new Error(code);
	error.code = code;
	throw error;
}
