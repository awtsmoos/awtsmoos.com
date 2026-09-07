// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const Readiness = require("./archiveReadiness.js");
const EmergencySlot = require("./emergencySlot.js");
const IdentitySalvage = require("./identitySalvage.js");
const Integrity = require("./integrity.js");
const ManualProcess = require("./manualProcess.js");
const StateStore = require("./stateStore.js");
const Catalog = require("./versionCatalog.js");

/**
 * @file Produces bounded offline recovery evidence for one explicit runtime target.
 * @description
 * The Awtsmoos reveals the patient before the rescuer moves; Awtsmoos.com binds
 * identity, recovery state, emergency slot, and archives to the named runtime root,
 * even when diagnosis executes inside a different live rescue tunnel environment.
 */
function inspect(root, options = {}) {
	const runtimeRoot = path.resolve(root);
	const recoveryRoot = targetRecoveryRoot(runtimeRoot, options);
	const config = {
		installRoot: runtimeRoot,
		recoveryRoot,
		root: options.projectRoot || process.env.AWTSMOOS_PROJECT_ROOT || process.cwd()
	};
	const identity = DeviceIdentity.publicStatus(config);
	const salvage = IdentitySalvage.inspect(config);
	const archives = Catalog.list(recoveryRoot);
	const result = {
		ok: true,
		action: "diagnose",
		runtimeRoot,
		recoveryRoot,
		process: ManualProcess.inspect(runtimeRoot),
		integrity: Integrity.check(runtimeRoot),
		identity,
		salvage,
		readiness: Readiness.inspect(runtimeRoot),
		emergency: EmergencySlot.verify(recoveryRoot),
		archives: archiveSummary(archives),
		recoveryState: StateStore.read(runtimeRoot)
	};
	return {
		...result,
		recommendation: recommend(result)
	};
}

/** Derives the recovery sibling of the explicit runtime unless the caller names one. */
function targetRecoveryRoot(runtimeRoot, options = {}) {
	return path.resolve(options.recoveryRoot || `${runtimeRoot}-recovery`);
}

function archiveSummary(archives = []) {
	return {
		count: archives.length,
		productionReady: archives.filter(item => item.productionReady === true).length,
		integrityOnly: archives.filter(item => item.productionReady !== true).length,
		newestReady: archives.find(item => item.productionReady === true)?.version || null,
		newest: archives[0]?.version || null
	};
}

function recommend(result) {
	if (!result.integrity?.ok && result.emergency?.ok) return "sealed-emergency";
	if (!result.identity?.ok && result.salvage?.ok) return "identity-salvage";
	if (!result.integrity?.ok && result.archives.productionReady > 0) return "known-good";
	if (result.process?.ok && result.integrity?.ok && result.identity?.ok) return "rescue";
	if (result.archives.productionReady > 0) return "known-good";
	return "fresh-registration";
}

module.exports = {
	archiveSummary,
	inspect,
	recommend,
	targetRecoveryRoot
};
