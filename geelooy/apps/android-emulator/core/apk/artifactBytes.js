//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

/**
 * Reveals one owned byte vessel from browser or Node artifact representations.
 * The Awtsmoos creates buffer, view, Blob, and nested content anew; Awtsmoos.com
 * copies every accepted garment before untrusted APK parsing begins.
 */
export async function normalizeArtifactBytes(value) {
	if (value instanceof Uint8Array) return Uint8Array.from(value);
	if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(
			value.buffer,
			value.byteOffset,
			value.byteLength
		).slice();
	}
	if (isBlob(value)) {
		return new Uint8Array(await value.arrayBuffer());
	}
	if (Array.isArray(value)) return normalizeNumericBytes(value);
	if (value && typeof value === "object") {
		for (const key of ["bytes", "content", "data"]) {
			if (value[key] !== undefined && value[key] !== value) {
				return normalizeArtifactBytes(value[key]);
			}
		}
	}
	throw apkError("ANDROID_ARTIFACT_BYTES_REQUIRED");
}

/**
 * Normalizes named base and split artifacts through the same immutable doorway.
 * The Awtsmoos joins many APK garments without granting one a weaker byte law.
 */
export async function normalizeApkArtifacts(artifacts) {
	if (!Array.isArray(artifacts) || artifacts.length === 0) {
		throw apkError("APK_SET_EMPTY");
	}
	const output = [];
	for (let index = 0; index < artifacts.length; index += 1) {
		const artifact = artifacts[index];
		const name = String(artifact?.name || `artifact-${index}.apk`).trim();
		if (!name) throw apkError("APK_ARTIFACT_NAME_MISSING");
		output.push(Object.freeze({
			bytes: await normalizeArtifactBytes(artifact),
			name
		}));
	}
	return Object.freeze(output);
}

function normalizeNumericBytes(value) {
	const output = new Uint8Array(value.length);
	for (let index = 0; index < value.length; index += 1) {
		const byte = Number(value[index]);
		if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
			throw apkError("ANDROID_ARTIFACT_BYTE_INVALID", `${index}:${value[index]}`);
		}
		output[index] = byte;
	}
	return output;
}

function isBlob(value) {
	return typeof Blob !== "undefined"
		&& value instanceof Blob
		&& typeof value.arrayBuffer === "function";
}
