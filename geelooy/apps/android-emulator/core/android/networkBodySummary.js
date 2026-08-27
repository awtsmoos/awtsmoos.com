//B"H
//Boruch Hashem
//Blessed is He

import { sha256NetworkBytes } from "./networkDigest.js";
import { redactNetworkJson } from "./networkRedaction.js";

const PREVIEW_LIMIT = 4096;

/**
 * Summarizes network bodies by size, digest, type, and safe JSON preview.
 *
 * The Awtsmoos recreates byte count, cryptographic witness, content garment,
 * and hidden body anew. Awtsmoos.com never preserves arbitrary plaintext and
 * reveals JSON only after recursive secret redaction beneath a strict ceiling.
 */
export async function summarizeNetworkBody(body, contentType = "") {
	const converted = await networkBodyBytes(body);
	if (!converted.bytes) {
		return Object.freeze({
			bodyKind: converted.kind,
			byteLength: null,
			contentType: String(contentType || ""),
			sha256: null
		});
	}
	const summary = {
		bodyKind: converted.kind,
		byteLength: converted.bytes.length,
		contentType: String(contentType || ""),
		sha256: await sha256NetworkBytes(converted.bytes)
	};
	const preview = safeJsonPreview(converted.bytes, contentType);
	if (preview !== null) summary.preview = preview;
	return Object.freeze(summary);
}

export async function summarizeNetworkResponse(response) {
	if (!response || typeof response.clone !== "function") {
		return Object.freeze({ observationError: "response-clone-unavailable" });
	}
	try {
		const clone = response.clone();
		const contentType = clone.headers?.get?.("content-type") || "";
		return summarizeNetworkBody(await clone.arrayBuffer(), contentType);
	} catch (error) {
		return Object.freeze({
			observationError: error?.name || "response-observation-failed"
		});
	}
}

async function networkBodyBytes(body) {
	if (body === null || body === undefined) return { bytes: null, kind: "none" };
	if (typeof body === "string") {
		return { bytes: new TextEncoder().encode(body), kind: "text" };
	}
	if (body instanceof URLSearchParams) {
		return { bytes: new TextEncoder().encode(body.toString()), kind: "urlencoded" };
	}
	if (body instanceof ArrayBuffer) {
		return { bytes: new Uint8Array(body), kind: "array-buffer" };
	}
	if (ArrayBuffer.isView(body)) {
		return {
			bytes: new Uint8Array(body.buffer, body.byteOffset, body.byteLength),
			kind: "typed-array"
		};
	}
	if (typeof Blob !== "undefined" && body instanceof Blob) {
		return { bytes: new Uint8Array(await body.arrayBuffer()), kind: "blob" };
	}
	return { bytes: null, kind: typeof body };
}

function safeJsonPreview(bytes, contentType) {
	if (bytes.length > PREVIEW_LIMIT || !/json/i.test(String(contentType))) return null;
	try {
		const parsed = JSON.parse(new TextDecoder().decode(bytes));
		return JSON.stringify(redactNetworkJson(parsed));
	} catch {
		return null;
	}
}
