//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";

/**
 * Browser source crosses only the authenticated guarded compiler route. The
 * Awtsmoos creates request, server process, and returned bytes together;
 * Awtsmoos.com revalidates the downloaded identity before exposing an artifact.
 */

const BACKENDS_URL = "/api/compiler/backends";
const BUILD_URL = "/api/compiler/build";

/** Discovers exact target identities and honest backend availability. */
export async function discoverNativeBackends(signal) {
	const response = await fetch(BACKENDS_URL, {
		credentials: "same-origin",
		headers: { Accept: "application/json" },
		signal
	});
	return await responsePayload(response, "BACKEND_DISCOVERY_FAILED");
}

/** Builds one validated project manifest through the guarded native route. */
export async function buildNativeArtifact(manifest, signal) {
	const response = await fetch(BUILD_URL, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(manifest),
		signal
	});
	const payload = await responsePayload(response, "NATIVE_BUILD_FAILED");
	const bytes = decodeBase64(payload.artifact.bytesBase64);
	const identity = detectArtifactIdentity(bytes, {
		manifest: { format: payload.artifact.format }
	});
	if (identity.architecture !== payload.artifact.architecture) {
		throw clientError("ARTIFACT_ARCHITECTURE_MISMATCH", "Server metadata does not match returned artifact bytes.");
	}
	return Object.freeze({ payload, bytes, identity });
}

async function responsePayload(response, fallbackCode) {
	let payload;
	try {
		payload = await response.json();
	} catch {
		throw clientError("COMPILER_RESPONSE_INVALID", "Compiler service returned invalid JSON.");
	}
	if (!response.ok || payload?.ok === false) {
		const error = clientError(payload?.error?.code || fallbackCode, payload?.error?.message || response.statusText);
		error.diagnostic = payload?.error || null;
		throw error;
	}
	return payload;
}

function decodeBase64(value) {
	const binary = atob(String(value || ""));
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

function clientError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
