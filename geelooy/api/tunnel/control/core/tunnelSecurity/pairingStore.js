// B"H
// Boruch Hashem
// Blessed is He

const { mutateStore } = require("../store.js");
const Approval = require("./pairingApproval.js");
const Id = require("./identifiers.js");
const Secrets = require("./secrets.js");

const PAIRING_LIFETIME_MS = 10 * 60 * 1000;

/**
 * @file Coordinates one-time backend-mediated native-device pairing.
 * @description
 * The Awtsmoos joins distant vessels without erasing their boundaries.
 * Awtsmoos.com lets a device request possession proof, an authenticated account
 * approve it once, and only that device recover the encrypted credential envelope.
 */

/** Creates an unauthenticated possession-bound pairing request. */
function createPairingRequest(input = {}) {
	if (!Secrets.validatePublicKey(input.devicePublicKey)) {
		return { ok: false, error: "invalid_device_public_key" };
	}
	const deviceId = Id.deviceId(input.deviceId);
	const tunnelName = Id.tunnelName(input.tunnelName);
	if (!deviceId || !tunnelName) {
		return { ok: false, error: "invalid_device_identity" };
	}
	const pairingId = `pair_${Secrets.randomToken(18)}`;
	const requestSecret = Secrets.randomToken(32);
	const userCode = Secrets.randomToken(6).toUpperCase();
	const expiresAt = Date.now() + PAIRING_LIFETIME_MS;
	mutateStore((store) => {
		store.tunnelPairings[pairingId] = {
			pairingId,
			requestSecretDigest: Secrets.digest(requestSecret),
			userCodeDigest: Secrets.digest(userCode),
			deviceId,
			tunnelName,
			deviceName: String(input.deviceName || "Tunnel Device").slice(0, 160),
			platform: String(input.platform || "unknown").slice(0, 80),
			devicePublicKey: String(input.devicePublicKey),
			state: "pending",
			createdAt: Date.now(),
			expiresAt
		};
		return store;
	});
	return { ok: true, pairingId, requestSecret, userCode, expiresAt };
}

/** Approves one matching pending code for the verified account. */
function approvePairing(accountId, userCode) {
	let result = { ok: false, error: "pairing_not_found" };
	mutateStore((store) => {
		result = Approval.approveInStore(store, accountId, userCode);
		return store;
	});
	return result;
}

/** Returns one encrypted credential envelope to the possessing device. */
function consumePairing(pairingId, requestSecret) {
	let result = { ok: false, error: "pairing_not_found" };
	mutateStore((store) => {
		const pairing = store.tunnelPairings[Id.normalizeIdentifier(pairingId)];
		const supplied = Secrets.digest(requestSecret);
		if (!pairing || pairing.expiresAt <= Date.now()) {
			return store;
		}
		if (!Secrets.secureEqual(pairing.requestSecretDigest, supplied)) {
			return store;
		}
		if (pairing.state !== "approved") {
			result = { ok: true, state: pairing.state };
			return store;
		}
		pairing.state = "consumed";
		pairing.consumedAt = Date.now();
		result = {
			ok: true,
			state: "approved",
			tunnelId: pairing.tunnelId,
			credentialEnvelope: pairing.credentialEnvelope
		};
		delete pairing.credentialEnvelope;
		return store;
	});
	return result;
}

module.exports = {
	PAIRING_LIFETIME_MS,
	approvePairing,
	consumePairing,
	createPairingRequest
};
