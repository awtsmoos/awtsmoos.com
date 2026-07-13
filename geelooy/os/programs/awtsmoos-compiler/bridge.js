//B"H
//Boruch Hashem
//Blessed is He

import { createEmbedEndpoint } from "../../../shared/embed/endpoint.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { normalizeBytes } from "../../../shared/compiling/native/byteReader.js";
import { NATIVE_LIMITS } from "../../../shared/compiling/native/limits.js";

/**
 * Source descends into the forge and measured bytes return to their desktop.
 * The Awtsmoos creates both directions together; Awtsmoos.com validates format,
 * architecture, and size again before the executable host receives authority.
 */

/** Connects one compiler iframe to its OS project and executable window. */
export function createCompilerBridge(options = {}) {
	const endpoint = createEmbedEndpoint({
		localId: "geelooy-os",
		remoteId: "apps-compiler",
		channelId: options.configuration.channelId,
		targetWindow: options.iframe.contentWindow,
		targetOrigin: options.configuration.targetOrigin,
		listenWindow: options.listenWindow || globalThis.window,
		onRejected: options.onRejected || reportRejectedMessage
	});
	endpoint.onEvent("embed.ready", () => {
		endpoint.sendEvent("compiler.source.open", options.source || {});
	});
	endpoint.onEvent("compiler.artifact.ready", payload => {
		try {
			openArtifact(options.os, payload);
		} catch (error) {
			reportRejectedArtifact(error, payload);
		}
	});
	return () => endpoint.stop();
}

function openArtifact(os, payload = {}) {
	const bytes = normalizeBytes(payload.bytes);
	if (bytes.byteLength > NATIVE_LIMITS.outputBytes) {
		throw bridgeError("OUTPUT_SIZE_LIMIT", "Compiler artifact exceeds the OS launch limit.");
	}
	const identity = detectArtifactIdentity(bytes, {
		extension: payload.extension,
		manifest: payload.artifactIdentity
			? { format: payload.artifactIdentity.format }
			: undefined
	});
	os.addWindow({
		title: payload.name || "Compiled Program",
		content: bytes,
		extension: payload.extension || "",
		path: payload.path || "/compiled",
		os,
		programName: "awtsmoosExecutable",
		artifactIdentity: identity,
		detectedFormat: identity.format,
		detectedArchitecture: identity.architecture,
		manifest: payload.metadata?.manifest || null,
		inspectOnly: payload.metadata?.manifest?.emulatorPreference === "inspect"
	});
}

function bridgeError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}

function reportRejectedMessage(rejection) {
	console.warn("BHY secure compiler message rejected", rejection);
}

function reportRejectedArtifact(error, payload) {
	console.error("BHY compiler artifact rejected", {
		code: error.code || "ARTIFACT_REJECTED",
		message: error.message,
		name: payload?.name || null
	});
}
