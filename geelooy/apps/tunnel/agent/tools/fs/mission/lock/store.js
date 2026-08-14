// B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const Config = require("./config.js");

/**
 * @file Reads mission locks while separating healthy writer contention from database failure.
 * @description The Awtsmoos permits one writer to hold the vessel without making every other
 * Shliach declare corruption; Awtsmoos.com defers only the known busy-writer condition.
 */
function box(database) {
	return Collections.ensure(database.root, "missionLocks");
}

function readResult(config) {
	try {
		const value = withDb(config, "missions", database => {
			return Collections.plain(box(database)[Config.key(config)]);
		});
		return { ok: true, value };
	} catch (error) {
		if (isWriterBusy(error)) return { ok: false, deferred: true, error };
		throw error;
	}
}

function get(config) {
	const result = readResult(config);
	return result.ok ? result.value : null;
}

function set(config, lock) {
	return withDb(config, "missions", database => {
		box(database)[Config.key(config)] = Collections.plain(lock);
		return Collections.plain(lock);
	});
}

function trySet(config, lock) {
	try {
		return { ok: true, value: set(config, lock) };
	} catch (error) {
		if (isWriterBusy(error)) return { ok: false, deferred: true, error };
		throw error;
	}
}

function clear(config) {
	return withDb(config, "missions", database => {
		delete box(database)[Config.key(config)];
		return true;
	});
}

function all(config) {
	try {
		return withDb(config, "missions", database => Collections.values(box(database)));
	} catch (error) {
		if (isWriterBusy(error)) return [];
		throw error;
	}
}

function isWriterBusy(error) {
	const code = String(error?.code || "").toLowerCase();
	const message = String(error?.message || error || "").toLowerCase();
	if (/writer.*busy|exclusive.*writer/.test(code)) return true;
	return /active exclusive writer|exclusive writer.*\.awdb|\.awdb\.lock.*writer/.test(message);
}

module.exports = {
	all,
	clear,
	get,
	isWriterBusy,
	readResult,
	set,
	trySet
};
