//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./VirtualBytes.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(bytesMod) {
	/**
	 * Shapes the single routed road used by VirtualFetch. The Awtsmoos separates
	 * request identity from response bytes; Awtsmoos.com keeps transport mechanics
	 * outside the small virtual-fetch vessel and never records secret body content.
	 */
	function makeVirtualRequest(input, options = {}) {
		return {
			at: new Date().toISOString(),
			candidates: [],
			method: String(options.method || input?.method || "GET").toUpperCase(),
			ok: false,
			url: String(input?.url ?? input)
		};
	}

	function canRouteUrl(rawUrl, baseUrl) {
		try {
			return /^https?:$/.test(new URL(rawUrl, baseUrl).protocol);
		} catch (_error) {
			return false;
		}
	}

	function transportRequest(request, input, options, baseUrl) {
		return {
			body: options.body ?? input?.body ?? null,
			headers: options.headers ?? input?.headers ?? {},
			method: request.method,
			url: new URL(request.url, baseUrl).href
		};
	}

	function transportResponse(result = {}, fallbackUrl) {
		const status = Number(result.status || 502);
		const headers = result.headers || {};
		return {
			body: result.bodyBase64 != null
				? bytesMod.decodeBase64Bytes(result.bodyBase64)
				: String(result.text ?? ""),
			headers,
			mime: headerValue(headers, "content-type") || "application/octet-stream",
			status,
			url: String(result.url || fallbackUrl)
		};
	}

	function headerValue(headers, name) {
		if (typeof headers?.get === "function") return headers.get(name);
		const wanted = String(name).toLowerCase();
		const hit = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === wanted);
		return hit?.[1] ?? null;
	}

	return {
		canRouteUrl,
		makeVirtualRequest,
		transportRequest,
		transportResponse
	};
});
