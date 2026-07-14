//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./VirtualFetchHelpers.js"));
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualFetch = factory(root.Merkava).VirtualFetch;
	}
})(typeof self !== "undefined" ? self : this, function(helperMod) {
	/**
	 * Carries guest fetches through exact virtual files and data URLs. The Awtsmoos
	 * creates every request and response anew; Awtsmoos.com records misses rather
	 * than granting a hidden road into the host network.
	 */
	class VirtualFetch {
		constructor(options = {}) {
			this.files = options.files || {};
			this.graph = options.graph || null;
			this.baseUrl = options.baseUrl || "http://127.0.0.1:8080/";
			this.requests = [];
		}

		async fetch(url, options = {}) {
			const request = {
				at: new Date().toISOString(),
				candidates: [],
				method: options.method || "GET",
				ok: false,
				url: String(url)
			};
			this.requests.push(request);
			this.graph?.event?.("network.request", request);
			if (/^data:/i.test(request.url)) {
				return this.respondDataUrl(request);
			}
			const hit = this.findFile(request.url, request);
			if (hit) {
				request.ok = true;
				request.key = hit.key;
				this.recordResponse(request.url, 200, { key: hit.key });
				return helperMod.virtualResponse(200, hit.body, request.url);
			}
			request.error = "virtual network miss";
			this.recordResponse(request.url, 404);
			return helperMod.virtualResponse(404, `Not Found: ${request.url}`, request.url);
		}

		respondDataUrl(request) {
			const parsed = helperMod.parseDataUrl(request.url);
			request.ok = parsed.ok;
			request.dataUrl = true;
			request.mime = parsed.mime;
			if (!parsed.ok) request.error = parsed.error;
			this.recordResponse(request.url, parsed.ok ? 200 : 400, { dataUrl: true });
			return helperMod.virtualResponse(
				parsed.ok ? 200 : 400,
				parsed.body,
				request.url,
				parsed.mime
			);
		}

		findFile(rawUrl, request) {
			const candidates = helperMod.fileCandidates(rawUrl, this.baseUrl);
			request.candidates = candidates;
			for (const key of candidates) {
				if (Object.prototype.hasOwnProperty.call(this.files, key)) {
					return { body: this.files[key], key };
				}
			}
			return helperMod.suffixHit(this.files, candidates);
		}

		recordResponse(url, status, extra = {}) {
			this.graph?.event?.("network.response", { ...extra, status, url });
		}

		toJSON() {
			return { requests: this.requests };
		}
	}

	return {
		VirtualFetch,
		fileCandidates: helperMod.fileCandidates,
		parseDataUrl: helperMod.parseDataUrl
	};
});
