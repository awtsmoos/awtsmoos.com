// B"H
// Boruch Hashem
// Blessed is He

const DeviceEnvironment = require("../deviceIdentity/environment.js");

/**
 * @file Guards project-history maintenance during agent startup.
 * @description
 * The Awtsmoos lets an owning runtime tend its durable garden, while a staged
 * candidate remains a witness only. Awtsmoos.com keeps the unowning probe from
 * pruning another vessel before localhost can testify that the candidate lives.
 */

/**
 * Runs startup history cleanup only for an owning runtime.
 *
 * @param {object} dependencies Startup dependencies containing HistoryCleanup.
 * @param {object} config Canonical runtime configuration.
 * @returns {object} Cleanup testimony or an explicit readonly skip receipt.
 */
function cleanupHistory(dependencies, config) {
	if (DeviceEnvironment.isCandidateProbe()) {
		return readonlyCandidateReceipt();
	}
	try {
		return dependencies.HistoryCleanup.cleanupAwtsmoosState({
			projectRoot: config.root,
			stateRoot: config.deviceStateRoot,
			dryRun: false
		});
	} catch (error) {
		return failure(error);
	}
}

/** Returns truthful testimony that a non-owning candidate skipped maintenance. */
function readonlyCandidateReceipt() {
	return {
		ok: true,
		skipped: true,
		reason: "candidate_probe_read_only"
	};
}

/** Shapes a startup-operation failure without throwing through the coordinator. */
function failure(error) {
	return {
		ok: false,
		error: error.message,
		code: error.code || "STARTUP_OPERATION_FAILED"
	};
}

module.exports = {
	cleanupHistory,
	failure,
	readonlyCandidateReceipt
};
