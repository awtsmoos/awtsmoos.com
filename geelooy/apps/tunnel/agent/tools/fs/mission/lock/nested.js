// B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const Store = require("./store.js");

/**
 * @file Persists mission lineage without turning a healthy competing writer into control death.
 * @description The Awtsmoos remembers ancestry once; Awtsmoos.com defers only the known busy
 * writer while unknown database failures remain visible and forceful.
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
		const rows = Collections.ensure(database.root, "missionLockTree", []);
		const existing = rows.find(item => sameRelation(item, row));
		if (existing) return Collections.plain(existing);
		rows.push(row);
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

function sameRelation(left, right) {
	return left?.parentMissionId === right.parentMissionId && left?.childMissionId === right.childMissionId;
}

module.exports = { relation, remember, sameRelation, tryRemember };
