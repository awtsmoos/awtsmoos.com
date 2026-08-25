// B"H
// Boruch Hashem
// Blessed is He

const Paths = require("../awdb/paths.js");

/**
 * @file Preserves the historical mission-AWDB contract while removing it from the critical path.
 * @description
 * The Awtsmoos lets yesterday's binary vessels remain untouched while today's mission
 * continues through the already-durable JSON ledger. Awtsmoos.com treats this adapter
 * as an optional mirror only; no mission action may fail because that mirror is sick.
 */
const DISABLED_CODE = "MISSION_AWDB_OPTIONAL_MIRROR_DISABLED";

/** Returns false while the stability release keeps JSON mission state authoritative. */
function enabled() {
	return false;
}

/** Returns false so callers never reopen a broken historical mirror for reads. */
function readable() {
	return false;
}

/**
 * Reports a successful no-op mirror write instead of turning optional indexing into a mission failure.
 * @param {object} config Tunnel runtime configuration.
 * @param {object} mission Mission record already persisted by the primary ledger.
 * @returns {object} Explicit compatibility receipt.
 */
function save(config, mission = {}) {
	return receipt(config, mission.id || "");
}

/** Returns no mirror record; the primary JSON mission ledger owns reads. */
function load() {
	return null;
}

/** Returns no mirror records; the primary JSON mission ledger owns enumeration. */
function all() {
	return [];
}

/** Keeps the historical skipped contract explicit for diagnostic callers. */
function disabled(config, id = "") {
	return receipt(config, id);
}

/** Returns bounded state explaining why the optional binary mirror is bypassed. */
function status(config = {}) {
	return {
		enabled: false,
		legacyReadable: false,
		mode: "disabled-optional-mirror",
		backend: "json-primary",
		preservedAwdbFile: Paths.dbFile(config, "missions"),
		code: DISABLED_CODE
	};
}

/** Builds one truthful no-op receipt without opening or mutating AwtsmoosDB. */
function receipt(config = {}, id = "") {
	return {
		ok: true,
		backend: "json-primary",
		skipped: true,
		optionalMirror: true,
		code: DISABLED_CODE,
		preservedAwdbFile: Paths.dbFile(config, "missions"),
		id
	};
}

/** Rejects direct internal-index use so no hidden path silently re-enters the disabled mirror. */
function indexes() {
	const error = new Error(DISABLED_CODE);
	error.code = DISABLED_CODE;
	throw error;
}

/** Preserves the historical failure helper shape for external diagnostics. */
function failure(config = {}, mission = {}, error = {}) {
	return {
		...receipt(config, mission.id || ""),
		ok: false,
		error: String(error?.message || error || DISABLED_CODE)
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
