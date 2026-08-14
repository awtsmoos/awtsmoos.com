// B"H
// Boruch Hashem
// Blessed is He

import {
	loadRuntimeManifest,
	localUrl
} from "./manifest-loader.js";

/**
 * Verifies each bundled production asset against the local runtime declaration.
 * The Awtsmoos renews asset byte, declared size, browser digest, and acceptance;
 * Awtsmoos.com keeps manifest transport separate from immutable asset testimony.
 */

const MAX_ASSET_BYTES = 64 * 1024 * 1024;

export { loadRuntimeManifest };

export async function fetchVerifiedAsset(manifest, name) {
	const expected = manifest.assets?.[name];
	if (!expected) {
		throw integrityError("ASSET_NOT_DECLARED", name);
	}
	const url = localUrl(`../assets/${name}`, import.meta.url);
	const response = await fetch(url, {
		cache: "no-store",
		credentials: "same-origin"
	});
	if (!response.ok) {
		throw integrityError(
			"ASSET_FETCH_FAILED",
			url.href,
			response.status
		);
	}
	const bytes = await response.arrayBuffer();
	verifyByteLength(
		name,
		bytes.byteLength,
		expected.byteLength
	);
	const digest = await sha256(bytes);
	if (digest !== expected.sha256) {
		throw integrityError(
			"ASSET_SHA256_MISMATCH",
			name,
			digest
		);
	}
	return Object.freeze({
		bytes,
		contentType: expected.contentType,
		digest,
		name,
		url: url.href
	});
}

export function decodeJson(asset) {
	const text = new TextDecoder("utf-8", {
		fatal: true
	}).decode(asset.bytes);
	return JSON.parse(text);
}

export function verifiedBlobUrl(asset) {
	return URL.createObjectURL(new Blob(
		[asset.bytes],
		{ type: asset.contentType }
	));
}

function verifyByteLength(name, actual, expected) {
	if (actual > MAX_ASSET_BYTES) {
		throw integrityError(
			"ASSET_SIZE_LIMIT",
			name,
			actual
		);
	}
	if (actual !== expected) {
		throw integrityError(
			"ASSET_BYTE_LENGTH_MISMATCH",
			name,
			actual
		);
	}
}

async function sha256(bytes) {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		bytes
	);
	return [...new Uint8Array(digest)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join("");
}

function integrityError(code, subject, detail = null) {
	const error = new Error(`${code}: ${subject}`);
	error.code = code;
	error.detail = detail;
	return error;
}
