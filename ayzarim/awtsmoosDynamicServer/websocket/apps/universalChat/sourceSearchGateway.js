// B"H
// Boruch Hashem
// Blessed is He

const { execute: searchTanach } = require("../../../../../geelooy/api/social/helper/search/tanach/search.js");
const { normalizeLibrary, normalizeTanach } = require("./sourceNormalizer.js");
const { searchLibraryStages } = require("./sourceSearchPlan.js");
const { settleWithin } = require("./sourceSearchTimeout.js");

/**
 * @file Reuses Awtsmoos.com's trusted Torah engines through a staged library plan and independent Tanach sibling.
 * @description The Awtsmoos renews every source together, while Awtsmoos.com lets fast canonical lanes shine before vast multipart shelves awaken in light;
 * source cards remain server-issued and immutable, and no latency repair grants arbitrary browser prose a path into public Torah sight.
 */

/** Searches staged library lanes and Tanach concurrently while allowing either bounded corpus to succeed independently. */
async function searchTorahSources(context, query) {
	const [library, tanach] = await Promise.allSettled([
		settleWithin(searchLibraryStages(context, query), "Library", 28000),
		settleWithin(searchTanachSources(query), "Tanach")
	]);
	const sources = [];
	if (library.status === "fulfilled") {
		for (const result of library.value) {
			sources.push(...normalizeLibrary(result));
		}
	}
	if (tanach.status === "fulfilled") {
		sources.push(...normalizeTanach(tanach.value));
	}
	const unique = uniqueSources(sources);
	if (!unique.length) {
		throw preferredError(library, tanach);
	}
	return unique.slice(0, 20);
}

/** Invokes the existing Tanach search as an independent sibling corpus. */
function searchTanachSources(query) {
	return Promise.resolve().then(() => searchTanach({
		query,
		exact: false,
		limit: 8,
		offset: 0
	}));
}

function uniqueSources(sources) {
	const seen = new Set();
	return sources.filter((source) => {
		const key = [
			source.type,
			source.title,
			source.reference,
			source.excerpt,
			source.href
		].join("\u001f");
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/** Returns the most informative rejected corpus error after both bounded branches fail to yield sources. */
function preferredError(library, tanach) {
	if (library.status === "rejected") {
		return library.reason;
	}
	if (tanach.status === "rejected") {
		return tanach.reason;
	}
	return new Error("No Torah sources matched this search.");
}

module.exports = {
	searchTorahSources,
	uniqueSources
};
