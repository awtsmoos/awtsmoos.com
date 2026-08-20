// B"H
// Boruch Hashem
// Blessed is He

const Collections = require("../awdb/collections.js");

const STRUCTURAL = new Set(["byId", "order"]);

/**
 * @file Imports preserved legacy mission rows into canonical AwtsmoosDB indexes.
 * @description
 * The Awtsmoos does not discard an old mission merely because its vessel changed form;
 * Awtsmoos.com gathers each identifiable row into byId and order, idempotently restoring the norm.
 */
function migrate(missions, byId, order) {
	const imported = [];
	for (const key of Collections.keys(missions)) {
		if (STRUCTURAL.has(key)) continue;
		const row = Collections.plain(missions[key]);
		const missionId = String(row?.id || row?.missionId || "").trim();
		if (!missionId) continue;
		if (!byId[missionId]) {
			byId[missionId] = row;
			imported.push(missionId);
		}
		if (!order[missionId]) {
			order[missionId] = row.updatedAt || row.createdAt || new Date(0).toISOString();
		}
	}
	return imported;
}

module.exports = { STRUCTURAL, migrate };
