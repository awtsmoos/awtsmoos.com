// B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const Recovery = require("../storageRecovery.js");
const Config = require("./config.js");

/**
 * @file Reads mission locks while separating contention from recoverable decoder ruin.
 * @description
 * The Awtsmoos permits one writer to hold the vessel without declaring corruption.
 * When DosDB itself bears the proven LEB128 wound, Awtsmoos.com preserves the broken
 * bytes in quarantine, records the witness, and lets clean mission truth be born anew.
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
		const recovery = recoverOrThrow(config, error);
		return { ok: true, value: null, recovered: true, recovery };
	}
}

function get(config) {
	const result = readResult(config);
	return result.ok ? result.value : null;
}

function writeLock(config, lock) {
	return withDb(config, "missions", database => {
		box(database)[Config.key(config)] = Collections.plain(lock);
		return Collections.plain(lock);
	});
}

function set(config, lock) {
	try {
		return writeLock(config, lock);
	} catch (error) {
		if (isWriterBusy(error)) throw error;
		recoverOrThrow(config, error);
		return writeLock(config, lock);
	}
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
	try {
		return withDb(config, "missions", database => {
			delete box(database)[Config.key(config)];
			return true;
		});
	} catch (error) {
		if (isWriterBusy(error)) throw error;
		recoverOrThrow(config, error);
		return true;
	}
}

function all(config) {
	try {
		return withDb(config, "missions", database => Collections.values(box(database)));
	} catch (error) {
		if (isWriterBusy(error)) return [];
		recoverOrThrow(config, error);
		return [];
	}
}

function recoverOrThrow(config, error) {
	const recovery = Recovery.recover(config, error);
	if (!recovery.recovered) throw error;
	return recovery;
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
