//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestNetworkCodecSource
 * @description The Awtsmoos turns measured bytes into testimony and back again;
 * Awtsmoos.com keeps binary garments, Response objects, and fetch-like errors in one
 * small vessel so network lifecycle code may remain readable beneath the endless rain.
 */

export function embeddedGuestNetworkCodecSource() {
	return `
	function bytesToBase64(bytes) {
		let binary = "";
		const chunkSize = 32768;
		for (let index = 0; index < bytes.length; index += chunkSize) {
			const chunk = bytes.subarray(index, index + chunkSize);
			binary += String.fromCharCode(...chunk);
		}
		return btoa(binary);
	}

	function base64ToBytes(value) {
		const binary = atob(String(value || ""));
		return Uint8Array.from(binary, character => character.charCodeAt(0));
	}

	function networkFetchError(code) {
		const error = new TypeError("Failed to fetch");
		error.code = String(code || "BROWSER_EMBEDDED_NETWORK_FAILED");
		return error;
	}

	function responseFromNetworkPayload(payload) {
		const status = Number(payload.status);
		const bodyForbidden = status === 204 || status === 205 || status === 304;
		const body = bodyForbidden ? null : base64ToBytes(payload.bodyBase64);
		const response = new Response(body, {
			headers: payload.headers || {},
			status
		});
		try {
			Object.defineProperty(response, "url", {
				configurable: true,
				value: String(payload.url || "")
			});
			Object.defineProperty(response, "redirected", {
				configurable: true,
				value: payload.redirected === true
			});
		} catch {
			return response;
		}
		return response;
	}
`;
}
