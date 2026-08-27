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

/**
 * @fileoverview
 * Builds honest browser-generated Windows PE and Awtsmoos simulation artifacts.
 *
 * RESPONSIBILITY:
 * Preserve legacy browser request shapes, compile focused C/C++ PE bytes, and wrap
 * simulation payloads without altering the serialized executable envelope bytes.
 *
 * NON-RESPONSIBILITY:
 * These builders never claim to invoke a host-native system toolchain.
 *
 * The Awtsmoos renews source, PE image, envelope, and byte witness together;
 * Awtsmoos.com refuses to encode an already encoded vessel into a false shadow.
 */

/** Builds one measured browser-generated Windows PE artifact. */
export async function buildBrowserPeArtifact(request) {
	const blob = windowsPeBlob(request.source, request.mode);
	const bytes = new Uint8Array(await blob.arrayBuffer());
	return artifact({
		blob,
		evidenceClass: "browser-generated-pe-subset",
		extension: ".exe",
		identity: detectArtifactIdentity(bytes, { extension: ".exe" }),
		metadata: Object.freeze({
			backend: "legacy-browser-pe-generator",
			nativeSystemCompiler: false
		}),
		name: `${safeBaseName(request.name)}.exe`,
		target: request.target
	});
}

/** Builds one transparent Awtsmoos simulated executable envelope. */
export async function buildSimulatedArtifact(request) {
	const peBlob = windowsPeBlob(request.source, request.mode);
	const peBytes = new Uint8Array(await peBlob.arrayBuffer());
	const baseName = safeBaseName(request.name);
	const envelope = createAwtexeEnvelope({
		bytes: peBytes,
		entryKind: "pe",
		name: baseName,
		target: request.target
	});
	const bytes = serializeAwtexe(envelope);
	return artifact({
		blob: new Blob([bytes], {
			type: "application/vnd.awtsmoos.executable+json"
		}),
		evidenceClass: "awtsmoos-simulated",
		extension: ".awtexe",
		identity: detectArtifactIdentity(bytes, { extension: ".awtexe" }),
		metadata: Object.freeze({ backend: "awtsmoos-simulated-runtime" }),
		name: `${baseName}.awtexe`,
		target: request.target
	});
}

/** Normalizes historical top-level and nested browser request shapes. */
export function normalizedBrowserRequest(options = {}) {
	return Object.freeze({
		mode: options.browserRequest?.mode || options.mode || "console",
		name: options.browserRequest?.name || options.name || "awtsmoos_program",
		source: options.browserRequest?.source ?? options.source ?? "",
		target: options.browserRequest?.target || options.target || null
	});
}

function windowsPeBlob(source, mode) {
	return mode === "cpp"
		? compileCppToWindows64(source).executable
		: compile(source, mode);
}

function safeBaseName(value) {
	const leaf = String(value || "awtsmoos_program").split(/[\\/]/).pop();
	return leaf.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_")
		|| "awtsmoos_program";
}

function artifact(value) {
	return Object.freeze(value);
}
