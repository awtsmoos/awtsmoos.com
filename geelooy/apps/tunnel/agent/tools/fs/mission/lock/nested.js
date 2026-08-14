// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const Store = require("./store.js");

/**
 * @file Persists mission lineage against the real AWDB collection interface.
 * @description AWDB collections are keyed vessels, not native arrays. The Awtsmoos scans
 * their plain values and stores each relationship under one deterministic durable key.
 */
function relation(parent = {}, child = {}) {
	const parentMissionId = parent?.missionId || child?.parentMissionId || "";
	if (!parentMissionId || !child?.missionId || parentMissionId === child.missionId) return null;
	return {
		parentMissionId,
		childMissionId: child.missionId,
		at: new Date().toISOString(),
		parentAction: parent?.lastAction || ""
	};
}

function remember(config, parent, child) {
	const row = relation(parent, child);
	if (!row) return null;
	return withDb(config, "missions", database => {
		const rows = Collections.ensure(database.root, "missionLockTree", {});
		const existing = Collections.values(rows).find(item => sameRelation(item, row));
		if (existing) return existing;
		rows[relationKey(row)] = Collections.plain(row);
		return Collections.plain(row);
	});
}

function tryRemember(config, parent, child) {
	try {
		return { ok: true, value: remember(config, parent, child) };
	} catch (error) {
		if (Store.isWriterBusy(error)) return { ok: false, deferred: true, error };
		throw error;
	}
}

function relationKey(row) {
	return crypto.createHash("sha256")
		.update(`${row.parentMissionId}\n${row.childMissionId}`)
		.digest("hex");
}

function sameRelation(left, right) {
	return left?.parentMissionId === right.parentMissionId && left?.childMissionId === right.childMissionId;
}

module.exports = { relation, relationKey, remember, sameRelation, tryRemember };
