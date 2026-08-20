//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaProxyTransport
 * @description The Awtsmoos lets guest fetch intent cross one host-owned bridge;
 * Awtsmoos.com resolves the guest road, keeps jar identity outside guest control,
 * and sends only request testimony through the existing authenticated Drive proxy.
 */

import { fetchRemotePage } from "./proxyClient.js";

export function createMerkavaProxyTransport(context = {}) {
	const pageUrl = requiredUrl(context.pageUrl);
	return async request => {
		const body = await proxyBody(request?.body);
		return fetchRemotePage({
			aliasId: context.aliasId,
			body: body.text,
			bodyBase64: body.base64,
			headers: headerObject(request?.headers),
			initiatorUrl: pageUrl,
			jarId: context.jarId || "default",
			method: request?.method || "GET",
			projectId: context.projectId || null,
			url: new URL(String(request?.url || ""), pageUrl).href
		}, context.fetchImpl || globalThis.fetch);
	};
}

function headerObject(headers) {
	const output = {};
	if (typeof headers?.forEach === "function") {
		headers.forEach((value, name) => {
			output[String(name)] = String(value);
		});
		return output;
	}
	for (const [name, value] of Object.entries(headers || {})) {
		output[String(name)] = String(value);
	}
	return output;
}

async function proxyBody(body) {
	if (body == null) return { base64: null, text: null };
	if (typeof body === "string") return { base64: null, text: body };
	if (body instanceof URLSearchParams) {
		return { base64: null, text: body.toString() };
	}
	if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
		return { base64: bytesToBase64(body), text: null };
	}
	if (typeof body?.arrayBuffer === "function") {
		return { base64: bytesToBase64(await body.arrayBuffer()), text: null };
	}
	return { base64: null, text: String(body) };
}

function bytesToBase64(value) {
	const bytes = value instanceof ArrayBuffer
		? new Uint8Array(value)
		: new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	let binary = "";
	for (let index = 0; index < bytes.length; index += 1) {
		binary += String.fromCharCode(bytes[index]);
	}
	return globalThis.btoa(binary);
}

function requiredUrl(value) {
	try {
		return new URL(String(value || "")).href;
	} catch {
		const error = new Error("BROWSER_PAGE_URL_REQUIRED");
		error.code = "BROWSER_PAGE_URL_REQUIRED";
		throw error;
	}
}
