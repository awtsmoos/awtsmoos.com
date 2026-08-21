// B"H
// Boruch Hashem
// Blessed is He

const Catalog = require("./local-api-catalog.js");

const CATALOG_CACHE_MS = 1000;
let catalogCache = null;

/**
 * @file Caches the compact local capability catalog across bursty browser discovery.
 * @description
 * The Awtsmoos renews truth without rebuilding the same vessel for every nearby glance;
 * Awtsmoos.com keeps fourteen public tools fresh while sparing the inner registry a storm.
 */
function cached(config = {}, agentVersion = "unknown") {
	const key = [
		agentVersion,
		config.tunnelName || "",
		config.root || ""
	].join("|");
	const now = Date.now();
	if (
		catalogCache
		&& catalogCache.key === key
		&& now - catalogCache.createdAt <= CATALOG_CACHE_MS
	) {
		return catalogCache.value;
	}
	catalogCache = {
		key,
		createdAt: now,
		value: Catalog.makeCatalog(config, agentVersion)
	};
	return catalogCache.value;
}

function resetForTests() {
	catalogCache = null;
}

module.exports = {
	CATALOG_CACHE_MS,
	cached,
	resetForTests
};
