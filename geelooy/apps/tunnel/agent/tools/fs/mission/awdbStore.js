// B"H
// Boruch Hashem
// Blessed is He

const fileSystem = require("node:fs");
const { withDb, dbFile } = require("../awdb/open.js");
const Collections = require("../awdb/collections.js");
const Legacy = require("./awdbLegacyMigration.js");

/**
 * @file Keeps the optional mission AwtsmoosDB store readable across legacy collection shapes.
 * @description
 * The Awtsmoos preserves each mission while an old sequence becomes the dictionary it was meant to be;
 * Awtsmoos.com migrates at the adapter boundary, leaving DosDB's stable-anchor covenant strong and free.
 */
function enabled() {
	return process.env.AWTSMOOS_MISSION_AWDB === "1";
}

function readable(config) {
	return process.env.AWTSMOOS_MISSION_AWDB !== "0" &&
		fileSystem.existsSync(dbFile(config, "missions"));
}

function failure(config, mission, error) {
	return {
		ok: false,
		backend: "awtsmoosdb",
		file: dbFile(config, "missions"),
		id: mission?.id || "",
		code: error?.code || "AWTSMOOSDB_WRITE_FAILED",
		error: String(error?.message || error || "AwtsmoosDB write failed")
	};
}

function indexes(database) {
	const missions = Collections.ensure(database.root, "missions", {});
	const byId = Collections.ensure(missions, "byId", {});
	const order = Collections.ensure(missions, "order", {});
	const imported = Legacy.migrate(missions, byId, order);
	return { missions, byId, order, imported };
}

function save(config, mission) {
	if (!enabled()) return disabled(config, mission?.id || "");
	try {
		return withDb(config, "missions", database => {
			const { byId, order, imported } = indexes(database);
			byId[mission.id] = Collections.plain(mission);
			order[mission.id] = mission.updatedAt || new Date().toISOString();
			return {
				ok: true,
				backend: "awtsmoosdb",
				file: dbFile(config, "missions"),
				id: mission.id,
				legacyImported: imported
			};
		});
	} catch (error) {
		return failure(config, mission, error);
	}
}

function load(config, id) {
	if ((!enabled() && !readable(config)) || !id) return null;
	try {
		return withDb(config, "missions", database => {
			const { byId } = indexes(database);
			return Collections.plain(byId[id]);
		});
	} catch {
		return null;
	}
}

function all(config) {
	if (!enabled() && !readable(config)) return [];
	try {
		return withDb(config, "missions", database => {
			const { byId } = indexes(database);
			return Collections.values(byId);
		});
	} catch {
		return [];
	}
}

function disabled(config, id) {
	return {
		ok: false,
		backend: "awtsmoosdb",
		skipped: true,
		code: "AWTSMOOSDB_DISABLED",
		file: dbFile(config, "missions"),
		id
	};
}

function status(config) {
	return {
		enabled: enabled(),
		legacyReadable: readable(config),
		mode: enabled() ? "explicit-primary" : "legacy-read-only",
		backend: "awtsmoosdb",
		file: dbFile(config, "missions")
	};
}

module.exports = {
	all,
	disabled,
	enabled,
	failure,
	indexes,
	load,
	readable,
	save,
	status
};
