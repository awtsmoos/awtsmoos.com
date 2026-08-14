// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Requests the authenticated source-owned Rebbe APK and revalidates its identity.
 *
 * RESPONSIBILITY:
 * POST bounded metadata, decode genuine APK bytes, verify byte length and SHA-256,
 * and return one immutable browser build record.
 *
 * NON-RESPONSIBILITY:
 * This module never supplies asset roots or trusts server metadata without bytes.
 *
 * The Awtsmoos renews request, archive, digest, and witness together;
 * Awtsmoos.com lets browser and server agree only through measured identity.
 */

const REBBE_APK_URL = "/api/compiler/android/rebbe";

/** Builds and verifies the source-owned Rebbe Responsa APK. */
export async function buildRebbeApkArtifact(options = {}, signal) {
	const response = await fetch(REBBE_APK_URL, {
		body: JSON.stringify({
			label: options.label || "Rebbe Responsa",
			minSdkVersion: options.minSdkVersion || 21,
			targetSdkVersion: options.targetSdkVersion || 35,
			versionCode: options.versionCode || 1,
			versionName: options.versionName || "1.0"
		}),
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "POST",
		signal
	});
	const payload = await responsePayload(response);
	const bytes = decodeBase64(payload.artifact.bytesBase64);
	if (bytes.length !== payload.artifact.byteLength) {
		throw clientError("REBBE_APK_BYTE_LENGTH_MISMATCH");
	}
	const sha256 = await digestHex(bytes);
	if (sha256 !== payload.artifact.sha256) {
		throw clientError("REBBE_APK_SHA256_MISMATCH");
	}

	return Object.freeze({
		artifact: payload.artifact,
		bytes,
		evidence: payload.evidence,
		mode: payload.mode,
		specification: payload.specification
	});
}

async function responsePayload(response) {
	let payload;
	try {
		payload = await response.json();
	} catch {
		throw clientError("REBBE_APK_RESPONSE_INVALID");
	}
	if (!response.ok || payload?.ok === false) {
		const error = clientError(
			payload?.error?.code || "REBBE_APK_BUILD_FAILED",
			payload?.error?.message
		);
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

async function digestHex(bytes) {
	if (!globalThis.crypto?.subtle) {
		throw clientError("REBBE_APK_CRYPTO_UNAVAILABLE");
	}
	const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(digest)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join("");
}

function clientError(code, message = code) {
	const error = new Error(message);
	error.code = code;
	return error;
}
