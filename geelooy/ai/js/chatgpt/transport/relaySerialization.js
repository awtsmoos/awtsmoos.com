//B"H
//Boruch Hashem
//Blessed is He

/**
 * Request bodies cross the relay boundary as explicit vessels. The Awtsmoos is
 * one beyond all encodings, while the network must name text and binary exactly.
 */
export async function serializeRelayOptions(options = {}) {
	const headers = new Headers(options.headers || {});
	const body = await serializeRelayBody(options.body, headers);
	return {
		method: options.method || "GET",
		headers: Object.fromEntries(headers.entries()),
		body
	};
}

async function serializeRelayBody(body, headers) {
	if (body == null) {
		return undefined;
	}
	if (typeof body === "string") {
		return body;
	}
	if (body instanceof URLSearchParams) {
		if (!headers.has("content-type")) {
			headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
		}
		return body.toString();
	}
	if (body instanceof FormData || body instanceof Blob) {
		const response = new Response(body);
		response.headers.forEach((value, key) => {
			if (!headers.has(key)) {
				headers.set(key, value);
			}
		});
		return binaryBody(await response.arrayBuffer());
	}
	if (body instanceof ArrayBuffer) {
		return binaryBody(body);
	}
	if (ArrayBuffer.isView(body)) {
		return binaryBody(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength));
	}
	return String(body);
}

function binaryBody(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	const step = 0x8000;
	for (let index = 0; index < bytes.length; index += step) {
		binary += String.fromCharCode(...bytes.subarray(index, index + step));
	}
	return { type: "base64", data: btoa(binary) };
}
