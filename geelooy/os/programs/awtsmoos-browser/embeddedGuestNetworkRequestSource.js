//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestNetworkRequestSource
 * @description The Awtsmoos lets native Request semantics clothe a virtual remote road;
 * Awtsmoos.com resolves relative URLs through the page testimony, measures bodies,
 * and gathers only ordinary request fields before the host proxy may carry the load.
 */

const MAX_BODY_BYTES = 1024 * 1024;

export function embeddedGuestNetworkRequestSource() {
	return `
	const NativeRequest = globalThis.Request;
	const MAX_NETWORK_BODY_BYTES = ${MAX_BODY_BYTES};

	class AwtsmoosVirtualRequest extends NativeRequest {
		constructor(input, init) {
			if (typeof input === "string" || input instanceof URL) {
				super(resolvedUrl(input), init);
				return;
			}
			super(input, init);
		}
	}

	globalThis.Request = AwtsmoosVirtualRequest;

	async function networkRequestPayload(input, init) {
		const request = input instanceof NativeRequest
			? new NativeRequest(input, init)
			: new NativeRequest(resolvedUrl(input), init);
		const headers = {};
		request.headers.forEach((value, name) => {
			headers[name] = value;
		});
		if (!headers.accept) headers.accept = "*/*";
		let bodyBase64 = "";
		if (request.method !== "GET" && request.method !== "HEAD") {
			const bytes = new Uint8Array(await request.clone().arrayBuffer());
			if (bytes.byteLength > MAX_NETWORK_BODY_BYTES) {
				throw networkFetchError("BROWSER_EMBEDDED_BODY_TOO_LARGE");
			}
			bodyBase64 = bytesToBase64(bytes);
		}
		return {
			message: {
				bodyBase64,
				credentials: request.credentials,
				headers,
				method: request.method,
				mode: request.mode,
				redirect: request.redirect,
				url: request.url
			},
			signal: request.signal
		};
	}
`;
}
