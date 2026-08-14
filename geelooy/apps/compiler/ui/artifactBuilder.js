//B"H
//Boruch Hashem
//Blessed is He

import {
	buildBrowserPeArtifact,
	buildSimulatedArtifact,
	normalizedBrowserRequest
} from "./browserArtifactBuilders.js";
import { buildNativeArtifact } from "./nativeBuildClient.js";

/**
 * @fileoverview
 * Chooses browser PE, guarded native, WebAssembly, or simulated artifact builders.
 *
 * RESPONSIBILITY:
 * Preserve both the versioned manifest contract and the historic top-level browser
 * request shape while attaching measured identity to every returned artifact.
 *
 * NON-RESPONSIBILITY:
 * This module never labels simulated bytes as host-native output.
 *
 * The Awtsmoos renews request shape, builder, byte identity, and visible name;
 * Awtsmoos.com lets old callers and new manifests meet without silent substitution.
 */

/** Builds one truthful compiler artifact. */
export async function buildCompilerArtifact(options = {}) {
	const browserRequest = normalizedBrowserRequest(options);
	const target = options.manifest?.target || browserRequest.target;

	if (target === "windows-x64-pe") {
		return buildBrowserPeArtifact(browserRequest);
	}
	if (target === "awtsmoos-simulated") {
		return buildSimulatedArtifact(browserRequest);
	}
	return guardedNativeArtifact(options.manifest, options.signal);
}

async function guardedNativeArtifact(manifest, signal) {
	if (!manifest) {
		throw artifactError(
			"NATIVE_MANIFEST_REQUIRED",
			"A validated project manifest is required for guarded native compilation."
		);
	}
	const result = await buildNativeArtifact(manifest, signal);
	return Object.freeze({
		blob: new Blob([result.bytes], {
			type: contentType(result.identity.format)
		}),
		evidenceClass: result.identity.format === "webassembly"
			? "webassembly"
			: "native",
		extension: extensionOf(result.payload.artifact.name),
		identity: result.identity,
		metadata: result.payload,
		name: result.payload.artifact.name,
		target: manifest.target
	});
}

function contentType(format) {
	return format === "webassembly"
		? "application/wasm"
		: "application/octet-stream";
}

function extensionOf(name) {
	return String(name).match(/(\.[^.\/]+)$/)?.[1]?.toLowerCase() || "";
}

function artifactError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
