// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines bounded path, identity, and MIME values for APK WebView publication.
 *
 * RESPONSIBILITY:
 * Validate virtual identities and package paths and map known asset extensions.
 *
 * NON-RESPONSIBILITY:
 * This module never opens IndexedDB or reads package bytes.
 *
 * The Awtsmoos renews name, path, type, and boundary together;
 * Awtsmoos.com gives each package asset one explicit browser-safe identity.
 */

export const APK_WEB_DATABASE = "awtsmoos-android-webviews";
export const APK_WEB_STORE = "assets";
export const APK_WEB_DATABASE_VERSION = 1;
export const APK_WEB_MAXIMUM_ASSETS = 4096;
export const APK_WEB_MAXIMUM_BYTES = 96 * 1024 * 1024;

/** Validates one unguessable persisted artifact identity. */
export function normalizeApkWebIdentifier(value) {
	const identifier = String(value || "");
	if (!/^[A-Za-z0-9._-]{8,128}$/.test(identifier)) {
		throw apkWebValueError("APK_WEB_ARTIFACT_ID_INVALID");
	}
	return identifier;
}

/** Validates and URL-encodes one declared package-relative asset path. */
export function encodedApkWebPath(value) {
	return normalizeApkWebPath(value)
		.split("/")
		.map(encodeURIComponent)
		.join("/");
}

/** Validates and returns one declared package-relative asset path. */
export function normalizeApkWebPath(value) {
	const path = String(value || "").replace(/^assets\//, "");
	if (!path || path.includes("\\")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw apkWebValueError("APK_WEB_ASSET_PATH_INVALID");
	}
	return path;
}

/** Returns the IndexedDB key for one artifact asset. */
export function apkWebRecordKey(artifactId, path) {
	return `${artifactId}|${path}`;
}

/** Returns an executable-safe MIME type for known packaged assets. */
export function apkWebMimeType(path) {
	const extension = path.split(".").pop()?.toLowerCase();
	return ({
		css: "text/css; charset=utf-8",
		html: "text/html; charset=utf-8",
		htm: "text/html; charset=utf-8",
		js: "text/javascript; charset=utf-8",
		mjs: "text/javascript; charset=utf-8",
		json: "application/json; charset=utf-8",
		wasm: "application/wasm",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		webp: "image/webp",
		woff: "font/woff",
		woff2: "font/woff2",
		mp3: "audio/mpeg",
		wav: "audio/wav",
		mp4: "video/mp4",
		webm: "video/webm"
	})[extension] || "application/octet-stream";
}

/** Creates one coded value error. */
export function apkWebValueError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
