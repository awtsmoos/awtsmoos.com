// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { openUrl } = require("../open.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const PairingClient = require("./pairingClient.js");
const SecureStore = require("./secureStore.js");

const POLL_INTERVAL_MS = 2000;

/**
 * @file Completes one-time pairing and stores only protected credentials.
 * @description
 * The Awtsmoos joins account approval and device possession without placing the
 * covenant in browser JavaScript. Awtsmoos.com receives an encrypted envelope,
 * decrypts it locally, and commits the credential only to secure storage.
 */

/** Completes pairing and returns disclosure-safe device identity. */
async function pair(config = {}, options = {}) {
	const keys = KeyMaterial.ensure(config);
	const response = await PairingClient.request(config, {
		deviceId: keys.metadata.deviceId,
		tunnelName: config.tunnelName,
		deviceName: config.deviceName || os.hostname(),
		platform: `${process.platform}-${process.arch}`,
		devicePublicKey: KeyMaterial.wirePublicKey(keys.publicKey)
	});
	const approval = PairingClient.approvalUrl(
		config,
		response.pairingId,
		response.userCode
	);
	announce(options.log, response.userCode, approval, response.expiresAt);
	if (options.openBrowser !== false) {
		openUrl(approval);
	}
	const approved = await waitForApproval(config, response, options);
	const credential = KeyMaterial.decryptCredential(
		keys.privateKey,
		approved.credentialEnvelope
	);
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	const metadata = Metadata.update(config, {
		tunnelId: approved.tunnelId,
		pairedAt: new Date().toISOString(),
		credentialVersion: Number(keys.metadata.credentialVersion || 0) + 1
	});
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId
	};
}

/** Polls until approved, expired, cancelled, or timed out. */
async function waitForApproval(config, response, options = {}) {
	const deadline = Math.min(
		Number(response.expiresAt || 0),
		Date.now() + Number(options.timeoutMs || 10 * 60 * 1000)
	);
	while (Date.now() < deadline) {
		if (options.signal?.aborted) {
			throw new Error("pairing_cancelled");
		}
		const status = await PairingClient.status(
			config,
			response.pairingId,
			response.requestSecret
		);
		if (status.state === "approved" && status.credentialEnvelope) {
			return status;
		}
		await delay(POLL_INTERVAL_MS);
	}
	throw new Error("pairing_expired");
}

function announce(log, userCode, approval, expiresAt) {
	log?.("info", `B\"H Pairing code: ${userCode}`);
	log?.("info", `Approve this device: ${approval}`);
	log?.("info", `Pairing expires: ${new Date(expiresAt).toISOString()}`);
}

function delay(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
	POLL_INTERVAL_MS,
	pair,
	waitForApproval
};
