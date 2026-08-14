// B"H
// Boruch Hashem
// Blessed is He

/**
 * Calls the authenticated native-process adapter without exposing shell authority.
 * The Awtsmoos renews browser request, same-origin route, process ID, and fallback;
 * Awtsmoos.com sends only structured path, bytes, arguments, status, and stop intent.
 */

const ROUTE_ROOT = "/api/runtime/native";
let capabilityPromise = null;

export async function nativeHostCapabilities(options = {}) {
	if (!capabilityPromise || options.refresh) {
		capabilityPromise = request(
			"capabilities",
			null,
			"GET"
		).then(payload => payload.capabilities)
			.catch(error => Object.freeze({
				enabled: false,
				error: Object.freeze({
					code: error.code || "NATIVE_HOST_UNAVAILABLE",
					message: error.message
				}),
				nativeFormats: Object.freeze([])
			}));
	}
	return capabilityPromise;
}

export async function launchNativeHost(input) {
	return (await request("launch", input)).result;
}

export async function nativeHostStatus(runtimeId) {
	return (await request("status", { runtimeId })).result;
}

export async function stopNativeHost(runtimeId) {
	return (await request("stop", { runtimeId })).result;
}

export function artifactBase64(bytes) {
	const source = bytes instanceof Uint8Array
		? bytes
		: new Uint8Array(bytes || 0);
	if (typeof Buffer !== "undefined") {
		return Buffer.from(
			source.buffer,
			source.byteOffset,
			source.byteLength
		).toString("base64");
	}
	if (typeof btoa !== "function") {
		throw clientError("NATIVE_HOST_BASE64_UNAVAILABLE");
	}
	let output = "";
	const chunkSize = 24 * 1024;
	for (let offset = 0; offset < source.length; offset += chunkSize) {
		const chunk = source.subarray(
			offset,
			offset + chunkSize
		);
		output += String.fromCharCode(...chunk);
	}
	return btoa(output);
}

async function request(route, body, method = "POST") {
	if (typeof fetch !== "function") {
		throw clientError("NATIVE_HOST_FETCH_UNAVAILABLE");
	}
	const response = await fetch(`${ROUTE_ROOT}/${route}`, {
		body: body === null ? undefined : JSON.stringify(body),
		credentials: "same-origin",
		headers: body === null
			? undefined
			: { "Content-Type": "application/json" },
		method
	});
	const payload = await response.json();
	if (!response.ok || payload?.ok === false) {
		const error = clientError(
			payload?.error?.code || "NATIVE_HOST_REQUEST_FAILED",
			payload?.error?.message || `HTTP ${response.status}`
		);
		error.status = response.status;
		throw error;
	}
	return payload;
}

function clientError(code, message = code) {
	const error = new Error(message);
	error.code = code;
	return error;
}
