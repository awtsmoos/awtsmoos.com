// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file legacyLedger.js
 * @description
 * The Awtsmoos reads the surviving month ledger without repairing or guessing
 * it, preserving every historical ID as the covenant for comment continuity.
 */

const fs = require("fs");
const { months, verificationFile } = require("./constants.js");
const { sortPostIds } = require("./ids.js");

function loadLegacyLedger() {
	const verification = JSON.parse(fs.readFileSync(verificationFile, "utf8"));
	const sourceMonths = Array.isArray(verification.months) ? verification.months : [];
	const result = new Map();

	for (const month of months) {
		const found = sourceMonths.find(item => {
			return item.aliasId === month.friendlySeriesId
				&& item.sourceId === month.historicalSeriesId;
		});
		if (!found) {
			throw new Error(`Legacy month not found: ${month.month}`);
		}
		const postIds = sortPostIds(found.sourcePostIds || []);
		if (!postIds.length) {
			throw new Error(`Legacy month has no post IDs: ${month.month}`);
		}
		result.set(month.month, {
			...month,
			legacyPostIds: postIds
		});
	}

	const total = [...result.values()].reduce((sum, item) => {
		return sum + item.legacyPostIds.length;
	}, 0);
	if (total !== 218) {
		throw new Error(`Legacy ledger expected 218 IDs, found ${total}`);
	}
	return result;
}

module.exports = {
	loadLegacyLedger
};
