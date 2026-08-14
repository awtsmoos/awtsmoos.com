//B"H
//Boruch Hashem
//Blessed is He

import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { compilePortableCProgram } from "../../../scripts/awtsmoos/compiling/native/c/compiler.js";
import { compile as compilePe } from "../../../scripts/awtsmoos/compiling/pe/compiler.js";
import { compileWasmGuiSource } from "../../../scripts/awtsmoos/compiling/wasm/compiler.js";
import {
	createAwtexeEnvelope,
	serializeAwtexe
} from "../../../shared/compiling/awtexeEnvelope.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { sourceCompilerForFormat } from "./compilerCatalog.js";
import {
	compileAppBundleSource,
	compileFatMachOSource
} from "./nativeContainers.js";
import { createSourceProvenance } from "./provenance.js";

/**
 * Compiles one source vessel into the exact executable form its runtime consumes.
 * The Awtsmoos renews compiler, container, bytes, identity, and digest together;
 * Awtsmoos.com never upgrades downloaded bytes into source-backed testimony.
 */

export async function compileSourceArtifact(format, source, options = {}) {
	const compiler = sourceCompilerForFormat(format);
	if (!compiler) {
		throw compileError("SOURCE_COMPILER_UNAVAILABLE", format);
	}
	const result = await compileByFormat(format, source, options);
	const measuredIdentity = detectArtifactIdentity(result.bytes, {
		extension: result.extension
	});
	const identity = format === "app-bundle"
		? Object.freeze({
			...measuredIdentity,
			format: "app-bundle",
			payloadFormat: measuredIdentity.format,
			valid: measuredIdentity.valid !== false
		})
		: measuredIdentity;
	const provenance = await createSourceProvenance({
		bytes: result.bytes,
		compiler,
		source
	});
	return Object.freeze({
		...result,
		compiler,
		format,
		identity,
		name: options.name || `source-${format}`,
		provenance,
		source: String(source)
	});
}

async function compileByFormat(format, source, options) {
	if (format === "pe") {
		return compilePeArtifact(source);
	}
	if (format === "elf") {
		return compilePortableArtifact(source, "linux-x64-static");
	}
	if (format === "mach-o") {
		return compilePortableArtifact(source, "macos-x64");
	}
	if (format === "mach-o-fat") {
		return compileFatMachOSource(source);
	}
	if (format === "app-bundle") {
		return compileAppBundleSource(source, options);
	}
	if (format === "webassembly") {
		const result = compileWasmGuiSource(source, options);
		return artifact(result.bytes, result.extension, result.backend);
	}
	if (format === "apk") {
		return compileApkArtifact(source, options);
	}
	if (format === "awtexe") {
		return compileAwtexeArtifact(source, options);
	}
	throw compileError("SOURCE_FORMAT_UNSUPPORTED", format);
}

async function compilePeArtifact(source) {
	const blob = compilePe(source, "c");
	return artifact(
		new Uint8Array(await blob.arrayBuffer()),
		".exe",
		"scratch-pe-c-gui-v1"
	);
}

async function compilePortableArtifact(source, target) {
	const result = await compilePortableCProgram(source, target);
	return artifact(result.bytes, result.extension, result.backend);
}

async function compileApkArtifact(source, options) {
	const result = await compileJavaActivityApk(source, {
		label: options.label || "Source-backed Android",
		versionCode: 1,
		versionName: "1.0"
	});
	return artifact(result.bytes, ".apk", result.mode);
}

function compileAwtexeArtifact(source, options) {
	const wasm = compileWasmGuiSource(source, options);
	const envelope = createAwtexeEnvelope({
		bytes: wasm.bytes,
		capabilities: ["window", "graphics", "console"],
		entryKind: "wasm",
		name: options.name || "Source Awtexe",
		target: "awtsmoos-simulated"
	});
	return artifact(
		serializeAwtexe(envelope),
		".awtexe",
		"awtexe-wasm-gui-envelope-v1"
	);
}

function artifact(bytes, extension, backend) {
	return Object.freeze({
		backend,
		bytes: Uint8Array.from(bytes),
		extension
	});
}

function compileError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	throw error;
}
