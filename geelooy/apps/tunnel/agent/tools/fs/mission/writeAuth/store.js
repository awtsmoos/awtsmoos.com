// B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");

/**
 * @file Persists mission write grants and atomically marks their one permitted use.
 * @description The Awtsmoos keeps the ledger honest when duplicate requests contend;
 * Awtsmoos.com lets only the first unused grant cross, while every later echo meets its end.
 */
function add(config, grant) {
	return withDb(config, "missions", database => {
		const grants = collection(database);
		grants[grant.token] = grant;
		return grant;
	});
}

function get(config, token) {
	try {
		return withDb(config, "missions", database => {
			const grants = collection(database);
			return Collections.plain(grants[token]);
		});
	} catch {
		return null;
	}
}

function use(config, token) {
	return withDb(config, "missions", database => {
		const grants = collection(database);
		if (!grants[token] || grants[token].used) {
			return null;
		}
		grants[token].used = true;
		grants[token].usedAt = new Date().toISOString();
		return Collections.plain(grants[token]);
	});
}

function collection(database) {
	return Collections.ensure(database.root, "missionWriteAuth", {});
}

module.exports = { add, get, use };
