// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { openUrl } = require("../open.js");
const Approval = require("./pairingApproval.js");
const Commit = require("./pairingCommit.js");
const Failure = require("./identityFailure.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pending = require("./pairingPending.js");

const MAXIMUM_REPAIR_ATTEMPTS = 0;

/**
 * @file Pairs one coherent physical witness without silently erasing a wounded one.
 * @description
 * The Awtsmoos renews the road but the witness does not vanish for convenience;
 * Awtsmoos.com sends incoherence to explicit recovery, never to automatic fresh-pair expedience.
 */
async function pair(config = {}, options = {}) {
	try {
		return await pairOnce(config, options);
	} catch (error) {
		if (Failure.isRecoverable(error)) {
			error.requiresIdentityRecovery = true;
			error.identityRecoveryCode = Failure.classify(error).code;
			options.log?.(
				"error",
				`B\"H physical identity recovery required; automatic destructive repair refused: ${error.identityRecoveryCode}`
			);
		}
		throw error;
	}
}

/** Runs one pairing attempt against the existing or explicitly authorized physical witness. */
async function pairOnce(config, options) {
	const keys = KeyMaterial.ensure(config);
	const pending = Pending.load(config, keys);
	const response = pending || await Pending.create(config, keys, {
		name: config.deviceName || os.hostname(),
		platform: `${process.platform}-${process.arch}`
	});
	const approval = response.approvalUrl;
	Approval.announce(options.log, response, approval);
	if (options.openBrowser !== false && !response.browserOpenedAt) {
		(options.openUrl || openUrl)(approval);
		Metadata.update(config, { pairingBrowserOpenedAt: new Date().toISOString() });
	}
	let approved;
	try {
		approved = await Approval.wait(config, response, options);
	} catch (error) {
		if (error?.message === "pairing_expired") {
			Pending.clear(config, keys.metadata.deviceId);
		}
		throw error;
	}
	return Commit.commit(config, keys, approved);
}

module.exports = {
	MAXIMUM_REPAIR_ATTEMPTS,
	POLL_INTERVAL_MS: Approval.POLL_INTERVAL_MS,
	PENDING_SECRET_KIND: Pending.PENDING_SECRET_KIND,
	clearPending: Pending.clear,
	createPending: Pending.create,
	loadPending: Pending.load,
	pair,
	pairOnce,
	waitForApproval: Approval.wait
};
