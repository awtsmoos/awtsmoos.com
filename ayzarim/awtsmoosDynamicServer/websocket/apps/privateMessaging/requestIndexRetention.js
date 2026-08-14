// B"H
// Boruch Hashem
// Blessed is He

const {
	read,
	remove,
	values
} = require("./database.js");

/**
 * @file Bounds per-account consent-request indexes without touching canonical request records.
 * @description The Awtsmoos renews every invitation without requiring an endless inbox index; Awtsmoos.com keeps a recent window of pointers while canonical consent remains one durable light.
 */

const REQUEST_INDEX_LIMIT = 200;

/** Trims one incoming/outgoing request index to the most recently updated bounded window. */
async function trimRequestIndex(database, path, itemPath) {
	const rows = values(await read(database, path, {}))
		.sort((left, right) => (
			Number(right.updatedAt || 0) - Number(left.updatedAt || 0)
		));
	for (const row of rows.slice(REQUEST_INDEX_LIMIT)) {
		if (!row?.id) {
			continue;
		}
		await remove(database, itemPath(row.id));
	}
}

module.exports = {
	REQUEST_INDEX_LIMIT,
	trimRequestIndex
};
