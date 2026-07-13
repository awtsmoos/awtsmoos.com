//B"H
//Boruch Hashem
//Blessed is He

import { compile } from "../compiler.js";
import { compileCppToWindows64 } from "../../../scripts/awtsmoos/compiling/cpp/compiler.js";
import {
	createAwtexeEnvelope,
	serializeAwtexe
} from "../../../shared/compiling/awtexeEnvelope.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { buildNativeArtifact } from "./nativeBuildClient.js";

/**
 * Browser generation, guarded native compilation, and simulation remain separate
 * evidence classes. The Awtsmoos creates form and substance together;
 * Awtsmoos.com validates bytes before naming any downloaded executable vessel.
 */

/** Builds one truthful browser, native, WebAssembly, or simulated artifact. */
export async function buildCompilerArtifact(options = {}) {
	const target = options.manifest?.target || options.browserRequest?.target;
	if (target === "windows-x64-pe") {
		return await legacyPeArtifact(options.browserRequest);
	}
	if (target === "awtsmoos-simulated") {
		return await simulatedArtifact(options.browserRequest);
	}
	return await guardedNativeArtifact(options.manifest, options.signal);
}

async function guardedNativeArtifact(manifest, signal) {
	const result = await buildNativeArtifact(manifest, signal);
	const blob = new Blob([result.bytes], { type: contentType(result.identity.format) });
	return artifact({
		name: result.payload.artifact.name,
		extension: extensionOf(result.payload.artifact.name),
		target: manifest.target,
		blob,
		identity: result.identity,
		evidenceClass: result.identity.format === "webassembly" ? "webassembly" : "native",
		metadata: result.payload
	});
}

async function legacyPeArtifact(request = {}) {
	const blob = windowsPeBlob(request.source, request.mode);
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const identity = detectArtifactIdentity(bytes, { extension: ".exe" });
	return artifact({
		name: `${safeBaseName(request.name)}.exe`,
		extension: ".exe",
		target: request.target,
		blob,
		identity,
		evidenceClass: "browser-generated-pe-subset",
		metadata: Object.freeze({
			backend: "legacy-browser-pe-generator",
			nativeSystemCompiler: false
		})
	});
}

async function simulatedArtifact(request = {}) {
	const peBlob = windowsPeBlob(request.source, request.mode);
	const peBytes = new Uint8Array(await peBlob.arrayBuffer());
	const baseName = safeBaseName(request.name);
	const envelope = createAwtexeEnvelope({
		name: baseName,
		target: request.target,
		entryKind: "pe",
		bytes: peBytes
	});
	const text = serializeAwtexe(envelope);
	const bytes = new TextEncoder().encode(text);
	const identity = detectArtifactIdentity(bytes, { extension: ".awtexe" });
	return artifact({
		name: `${baseName}.awtexe`,
		extension: ".awtexe",
		target: request.target,
		blob: new Blob([text], { type: "application/vnd.awtsmoos.executable+json" }),
		identity,
		evidenceClass: "awtsmoos-simulated",
		metadata: Object.freeze({ backend: "awtsmoos-simulated-runtime" })
	});
}

function windowsPeBlob(source, mode) {
	return mode === "cpp"
		? compileCppToWindows64(source).executable
		: compile(source, mode);
}

function artifact(value) {
	return Object.freeze(value);
}

function contentType(format) {
	return format === "webassembly" ? "application/wasm" : "application/octet-stream";
}

function extensionOf(name) {
	return String(name).match(/(\.[^.\/]+)$/)?.[1]?.toLowerCase() || "";
}

function safeBaseName(value) {
	const leaf = String(value || "awtsmoos_program").split(/[\\/]/).pop();
	return leaf.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_") || "awtsmoos_program";
}
