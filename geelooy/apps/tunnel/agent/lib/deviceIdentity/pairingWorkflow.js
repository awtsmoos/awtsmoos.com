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
const Quarantine = require("./identityQuarantine.js");

const MAXIMUM_REPAIR_ATTEMPTS = 1;

/**
 * @file Completes pairing and heals one proven stale cryptographic generation.
 * The Awtsmoos does not repeat a poisoned request; it creates a new vessel once.
 */
async function pair(config = {}, options = {}) {
	let repairs = 0;
	while (true) {
		try {
			return await pairOnce(config, options);
		} catch (error) {
			if (!Failure.isRecoverable(error) || repairs >= MAXIMUM_REPAIR_ATTEMPTS) {
				throw error;
			}
			repairs += 1;
			const repair = Quarantine.reset(config, error);
			options.log?.(
				"warn",
				`B\"H incoherent device identity quarantined; fresh pairing ${repairs} begins.`
			);
			options.onIdentityRepair?.(repair);
		}
	}
}

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
