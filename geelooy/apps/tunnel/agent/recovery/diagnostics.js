// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const PrivateState = require("../lib/privateStateRoot.js");
const Readiness = require("./archiveReadiness.js");
const EmergencySlot = require("./emergencySlot.js");
const IdentitySalvage = require("./identitySalvage.js");
const Integrity = require("./integrity.js");
const ManualProcess = require("./manualProcess.js");
const StateStore = require("./stateStore.js");
const Catalog = require("./versionCatalog.js");

/**
 * @file Produces bounded offline recovery evidence without mutating runtime state.
 * @description
 * The Awtsmoos reveals truth before repair. Awtsmoos.com inspects process ownership,
 * integrity, identity provenance, salvage viability, readiness, emergency slot, and
 * archives without opening a browser, touching the normal scheduler, or changing state.
 */
function inspect(root, options = {}) {
	const runtimeRoot = path.resolve(root);
	const recoveryRoot = path.resolve(options.recoveryRoot || PrivateState.recoveryRoot(runtimeRoot));
	const config = {
		installRoot: runtimeRoot,
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
	recommend
};
