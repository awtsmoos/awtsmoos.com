//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedNetworkPolicyShared
 * @description The Awtsmoos keeps one small grammar for IDs, URLs, sizes, and error light;
 * Awtsmoos.com lets request and response guardians share exact truth without growing
 * one crowded file whose hidden branches become difficult to read by day or night.
 */

export function embeddedPolicyError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

export function requiredEmbeddedRequestId(value) {
	const id = typeof value === "string" ? value : "";
	if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_REQUEST_ID_INVALID", 400);
	}
	return id;
}

export function requiredEmbeddedHttpUrl(value, code, base) {
	try {
		const url = new URL(String(value || ""), base || undefined);
		if (!["http:", "https:"].includes(url.protocol)) throw new Error(code);
		return url;
	} catch {
		throw embeddedPolicyError(code, 400);
	}
}

export function assertEmbeddedSameOrigin(target, page, code) {
	if (target.origin !== page.origin) {
		throw embeddedPolicyError(code, 403);
	}
}

export function decodedBase64Length(value) {
	if (!value) return 0;
	const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
	return Math.floor((value.length * 3) / 4) - padding;
}

export function decodeEmbeddedBase64(value, maxBytes) {
	if (value == null || value === "") return new Uint8Array(0);
	if (!validBase64(value)) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_BODY_INVALID", 400);
	}
	if (decodedBase64Length(value) > maxBytes) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_BODY_TOO_LARGE", 413);
	}
	try {
		const binary = globalThis.atob(value);
		return Uint8Array.from(binary, character => character.charCodeAt(0));
	} catch {
		throw embeddedPolicyError("BROWSER_EMBEDDED_BODY_INVALID", 400);
	}
}

function validBase64(value) {
	return typeof value === "string"
		&& value.length % 4 === 0
		&& /^[A-Za-z0-9+/]*={0,2}$/.test(value);
}
