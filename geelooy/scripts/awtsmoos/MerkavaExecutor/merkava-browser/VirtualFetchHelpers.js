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
	 * Resolves virtual URLs and response garments without host networking. The
	 * Awtsmoos creates candidate, suffix, data spring, and response anew;
	 * Awtsmoos.com keeps every request inside the supplied guest file constellation.
	 */
	function parseDataUrl(raw) {
		try {
			const bodyStart = String(raw).indexOf(",");
			if (bodyStart < 0) {
				return malformedDataUrl();
			}
			const meta = String(raw).slice(5, bodyStart);
			const encoded = String(raw).slice(bodyStart + 1);
			const parts = meta.split(";").filter(Boolean);
			const mime = parts[0] || "text/plain;charset=US-ASCII";
			const isBase64 = parts.some(value => value.toLowerCase() === "base64");
			const body = isBase64
				? bytesMod.decodeBase64(encoded)
				: decodeURIComponent(encoded);
			return { body, mime, ok: true };
		} catch (error) {
			return { body: "", error: error.message, mime: "text/plain", ok: false };
		}
	}

	function virtualResponse(status, body, url, mime = "text/plain") {
		const text = String(body);
		return {
			arrayBuffer: async () => bytesMod.encodeUtf8(text).buffer,
			blob: async () => ({
				size: bytesMod.byteLength(text),
				text: async () => text,
				type: mime
			}),
			headers: {
				get(name) {
					return String(name).toLowerCase() === "content-type"
						? mime
						: null;
				}
			},
			json: async () => JSON.parse(text),
			ok: status >= 200 && status < 300,
			status,
			text: async () => text,
			url: String(url || "")
		};
	}

	function fileCandidates(rawUrl, baseUrl) {
		const output = [];
		addCandidate(output, rawUrl);
		try {
			const url = new URL(String(rawUrl), baseUrl || "http://127.0.0.1/");
			const noHash = new URL(url.href);
			noHash.hash = "";
			const noQuery = new URL(noHash.href);
			noQuery.search = "";
			for (const value of [
				url.href,
				noHash.href,
				noQuery.href,
				decodeURIComponent(noQuery.pathname || ""),
				decodeURIComponent(url.pathname || "")
			]) {
				addCandidate(output, value);
			}
		} catch (_error) {}
		return [...new Set(output.filter(Boolean))];
	}

	function suffixHit(files, candidates) {
		const keys = Object.keys(files || {});
		for (const candidate of candidates.map(stripParents).filter(Boolean)) {
			const clean = candidate.replace(/^\.\//, "").replace(/^\//, "");
			const hits = keys.filter(key => key === clean || key.endsWith(`/${clean}`));
			if (hits.length === 1) {
				return { body: files[hits[0]], key: hits[0] };
			}
		}
		return null;
	}

	function addCandidate(output, value) {
		const clean = String(value || "").replace(/\\/g, "/");
		if (!clean) return;
		const bare = clean.replace(/^\.\//, "").replace(/^\?\//, "");
		output.push(clean, bare, `/${bare}`, `./${bare}`);
		const stripped = stripParents(clean);
		output.push(stripped, `/${stripped}`, `./${stripped}`);
	}

	function stripParents(value) {
		let clean = String(value || "").replace(/^\.\//, "").replace(/^\//, "");
		while (clean.startsWith("../")) clean = clean.slice(3);
		return clean;
	}

	function malformedDataUrl() {
		return { body: "", error: "malformed data URL", mime: "text/plain", ok: false };
	}

	return { fileCandidates, parseDataUrl, suffixHit, virtualResponse };
});
