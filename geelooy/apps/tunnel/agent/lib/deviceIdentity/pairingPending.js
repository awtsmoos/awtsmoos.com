// B"H
// Boruch Hashem
// Blessed is He

const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const PairingClient = require("./pairingClient.js");
const SecureStore = require("./secureStore.js");

const PENDING_SECRET_KIND = "pairing-request-secret";

/** Keeps one resumable pairing request bound to one proven key generation. */
async function create(config, keys, device = {}) {
	const response = await PairingClient.request(config, {
		deviceId: keys.metadata.deviceId,
		tunnelName: config.tunnelName,
		deviceName: device.name,
		platform: device.platform,
		devicePublicKey: KeyMaterial.wirePublicKey(keys.publicKey)
	});
	const approvalUrl = PairingClient.approvalUrl(
		config,
		response.pairingId,
		response.userCode
	);
	SecureStore.write(keys.metadata.deviceId, PENDING_SECRET_KIND, response.requestSecret);
	Metadata.update(config, {
		pairingId: response.pairingId,
		pairingUserCode: response.userCode,
		pairingExpiresAt: Number(response.expiresAt),
		pairingApprovalUrl: approvalUrl,
		pairingBrowserOpenedAt: null,
		pairingKeyFingerprint: keys.fingerprint
	});
	return { ...response, approvalUrl, browserOpenedAt: null };
}

function load(config, keys) {
	const metadata = Metadata.read(config);
	const expired = Number(metadata?.pairingExpiresAt) <= Date.now();
	const wrongKey = metadata?.pairingKeyFingerprint &&
		metadata.pairingKeyFingerprint !== keys.fingerprint;
	if (!metadata?.pairingId || expired || wrongKey) {
		clear(config, keys.metadata.deviceId);
		return null;
	}
	const requestSecret = SecureStore.read(keys.metadata.deviceId, PENDING_SECRET_KIND);
	if (!requestSecret) {
		clear(config, keys.metadata.deviceId);
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

function clear(config, deviceId) {
	if (deviceId) SecureStore.remove(deviceId, PENDING_SECRET_KIND);
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId) return;
	Metadata.update(config, {
		pairingId: null,
		pairingUserCode: null,
		pairingExpiresAt: null,
		pairingApprovalUrl: null,
		pairingBrowserOpenedAt: null,
		pairingKeyFingerprint: null
	});
}

module.exports = { PENDING_SECRET_KIND, clear, create, load };
