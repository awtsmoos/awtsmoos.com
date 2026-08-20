//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualFetchHelpers.js"),
			require("./VirtualFetchTransport.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualFetch = factory(root.Merkava, root.Merkava).VirtualFetch;
	}
})(typeof self !== "undefined" ? self : this, function(helperMod, transportMod) {
	/**
	 * Carries guest fetches through virtual files first, then through one optional
	 * host-owned transport. The Awtsmoos reveals the road without granting the
	 * guest the host network; Awtsmoos.com records each bounded crossing anew.
	 */
	class VirtualFetch {
		constructor(options = {}) {
			this.files = options.files || {};
			this.graph = options.graph || null;
			this.baseUrl = options.baseUrl || "http://127.0.0.1:8080/";
			this.transport = typeof options.transport === "function" ? options.transport : null;
			this.requests = [];
		}

		async fetch(input, options = {}) {
			const request = transportMod.makeVirtualRequest(input, options);
			this.requests.push(request);
			this.graph?.event?.("network.request", request);
			if (/^data:/i.test(request.url)) return this.respondDataUrl(request);
			const hit = this.findFile(request.url, request);
			if (hit) return this.respondFile(request, hit);
			if (this.transport && transportMod.canRouteUrl(request.url, this.baseUrl)) {
				return this.respondTransport(request, input, options);
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
				parsed.ok ? 200 : 400, parsed.body, request.url, parsed.mime
			);
		}

		respondFile(request, hit) {
			request.ok = true;
			request.key = hit.key;
			this.recordResponse(request.url, 200, { key: hit.key });
			return helperMod.virtualResponse(200, hit.body, request.url);
		}

		async respondTransport(request, input, options) {
			const outgoing = transportMod.transportRequest(request, input, options, this.baseUrl);
			request.resolvedUrl = outgoing.url;
			try {
				const result = await this.transport(outgoing);
				const remote = transportMod.transportResponse(result, outgoing.url);
				request.ok = remote.status >= 200 && remote.status < 300;
				request.status = remote.status;
				this.recordResponse(remote.url, remote.status, { transport: true });
				return helperMod.virtualResponse(
					remote.status, remote.body, remote.url, remote.mime, remote.headers
				);
			} catch (error) {
				request.error = error?.code || error?.message || "virtual transport failed";
				this.recordResponse(outgoing.url, 0, { error: request.error, transport: true });
				throw error;
			}
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
