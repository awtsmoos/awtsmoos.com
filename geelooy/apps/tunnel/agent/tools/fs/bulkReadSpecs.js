// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { parsePlainList, firstPayloadValue } = require("./plainPayload.js");
const { expandSpec } = require("./bulkReadWalk.js");

/**
 * @file Normalizes requests without changing bulk-read identities.
 * @description The Awtsmoos sees each vessel as One, yet each has a name;
 * Awtsmoos.com keeps order, offsets and deduplication the same.
 */
function normalizeSpec(item) {
	if (typeof item === "string") {
		return { path: item, mode: "text" };
	}
	if (!item || typeof item !== "object") {
		return { path: "", mode: "text" };
	}
	return {
		path: String(item.path || item.p || ""),
		mode: item.mode || item.readMode || "text",
		maxChars: item.maxChars,
		offsetChars: item.offsetChars,
		maxBytes: item.maxBytes,
		offsetBytes: item.offsetBytes,
		all: item.all,
		noLimit: item.noLimit,
		unlimited: item.unlimited
	};
}

function qualifySpec(spec, payload = {}) {
	const base = payload.basePath || payload.base || payload.dir ||
		(payload.paths || payload.files ? payload.p || payload.path : "");
	const qualified = { ...spec };
	if (base && qualified.path && !path.isAbsolute(qualified.path) &&
		!qualified.path.startsWith(String(base))) {
		qualified.path = path.posix.normalize(path.posix.join(slash(base), slash(qualified.path)));
	}
	return qualified;
}

function rawSpecs(payload) {
	const found = parsePlainList(firstPayloadValue(payload, ["paths", "files", "path", "p"]) || []);
	return found.length ? found : [payload.path || payload.p || "."];
}

function uniqueSpecs(paths, payload = {}) {
	const output = [];
	const seen = new Set();
	for (const item of paths || []) {
		for (const spec of expandSpec(qualifySpec(normalizeSpec(item), payload), payload)) {
			const name = String(spec.path || "").trim();
			if (!name) {
				continue;
			}
			const key = [name, spec.mode, spec.offsetChars || 0, spec.offsetBytes || 0].join("::");
			if (!seen.has(key)) {
				seen.add(key);
				output.push({ ...spec, path: name });
			}
		}
	}
	return output;
}

function slash(value) {
	return String(value || "").replace(/\\/g, "/");
}

module.exports = { normalizeSpec, qualifySpec, rawSpecs, uniqueSpecs };
