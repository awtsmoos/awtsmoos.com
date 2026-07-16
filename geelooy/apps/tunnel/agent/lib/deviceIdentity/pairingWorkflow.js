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
const PENDING_SECRET_KIND = "pairing-request-secret";

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
	const pending = loadPending(config, keys.metadata.deviceId);
	const response = pending || await createPending(config, keys);
	const approval = response.approvalUrl || PairingClient.approvalUrl(
		config, response.pairingId, response.userCode
	);
	announce(options.log, response.userCode, approval, response.expiresAt);
	if (options.openBrowser !== false && !response.browserOpenedAt) {
		(options.openUrl || openUrl)(approval);
		Metadata.update(config, { pairingBrowserOpenedAt: new Date().toISOString() });
	}
	let approved;
	try {
		approved = await waitForApproval(config, response, options);
	} catch (error) {
		if (error?.message === "pairing_expired") clearPending(config, keys.metadata.deviceId);
		throw error;
	}
	const credential = KeyMaterial.decryptCredential(
		keys.privateKey,
		approved.credentialEnvelope
	);
	SecureStore.write(keys.metadata.deviceId, "credential", credential);
	const completedPending = Metadata.read(config) || {};
	const metadata = Metadata.update(config, {
		tunnelId: approved.tunnelId,
		pairedAt: new Date().toISOString(),
		credentialVersion: Number(keys.metadata.credentialVersion || 0) + 1,
		lastControlOpenedAt: completedPending.pairingBrowserOpenedAt ||
			completedPending.lastControlOpenedAt || null,
		pairingId: null,
		pairingUserCode: null,
		pairingExpiresAt: null,
		pairingApprovalUrl: null,
		pairingBrowserOpenedAt: null
	});
	SecureStore.remove(keys.metadata.deviceId, PENDING_SECRET_KIND);
	return {
		ok: true,
		state: "paired",
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId
	};
}

/** Creates and durably records one resumable pairing transaction. */
async function createPending(config, keys) {
	const response = await PairingClient.request(config, {
		deviceId: keys.metadata.deviceId,
		tunnelName: config.tunnelName,
		deviceName: config.deviceName || os.hostname(),
		platform: `${process.platform}-${process.arch}`,
		devicePublicKey: KeyMaterial.wirePublicKey(keys.publicKey)
	});
	const approvalUrl = PairingClient.approvalUrl(
		config, response.pairingId, response.userCode
	);
	SecureStore.write(keys.metadata.deviceId, PENDING_SECRET_KIND, response.requestSecret);
	Metadata.update(config, {
		pairingId: response.pairingId,
		pairingUserCode: response.userCode,
		pairingExpiresAt: Number(response.expiresAt),
		pairingApprovalUrl: approvalUrl,
		pairingBrowserOpenedAt: null
	});
	return { ...response, approvalUrl, browserOpenedAt: null };
}

/** Loads a still-live pairing request while its secret remains in Keychain. */
function loadPending(config, deviceId) {
	const metadata = Metadata.read(config);
	if (!metadata?.pairingId || Number(metadata.pairingExpiresAt) <= Date.now()) {
		clearPending(config, deviceId);
		return null;
	}
	const requestSecret = SecureStore.read(deviceId, PENDING_SECRET_KIND);
	if (!requestSecret) {
		clearPending(config, deviceId);
		return null;
	}
	return {
		pairingId: metadata.pairingId,
		userCode: metadata.pairingUserCode,
		expiresAt: Number(metadata.pairingExpiresAt),
		approvalUrl: metadata.pairingApprovalUrl,
		browserOpenedAt: metadata.pairingBrowserOpenedAt,
		requestSecret
	};
}

/** Clears only pending approval state, never an established device credential. */
function clearPending(config, deviceId) {
	if (deviceId) SecureStore.remove(deviceId, PENDING_SECRET_KIND);
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId) return;
	Metadata.update(config, {
		pairingId: null,
		pairingUserCode: null,
		pairingExpiresAt: null,
		pairingApprovalUrl: null,
		pairingBrowserOpenedAt: null
	});
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
	PENDING_SECRET_KIND,
	clearPending,
	createPending,
	loadPending,
	pair,
	waitForApproval
};
