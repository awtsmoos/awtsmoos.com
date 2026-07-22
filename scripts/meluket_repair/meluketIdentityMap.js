// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MeluketIdentityMap
 * @description
 * The federation map joins each legacy packed post identity to the current
 * source-series identity used by live membership and imported comments.
 */

const fs = require("fs");
const {
	MELUKET_MAP_FILE
} = require("./meluketRepairConstants.js");

function readIdentityMap() {
	const value = JSON.parse(fs.readFileSync(MELUKET_MAP_FILE, "utf8"));
	const entries = value?.entries;
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
		throw new Error("Invalid Meluket identity map.");
	}
	const bySource = new Map();
	for (const [compoundKey, legacy] of Object.entries(entries)) {
		const [sourceId, currentPostId] = compoundKey.split("\u0000");
		if (!sourceId || !currentPostId || !legacy?.oldPostId) {
			throw new Error(`Invalid Meluket identity entry: ${compoundKey}`);
		}
		if (!bySource.has(sourceId)) bySource.set(sourceId, new Map());
		bySource.get(sourceId).set(legacy.oldPostId, {
			aliasId: legacy.oldSeriesId,
			currentPostId,
			legacyPostId: legacy.oldPostId,
			title: legacy.title
		});
	}
	return {
		bySource,
		count: Object.keys(entries).length
	};
}

module.exports = {
	readIdentityMap
};
