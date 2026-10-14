// B"H
// Boruch Hashem
// Blessed is He

const { mutateStore, readStore } = require("../store.js");
const Approval = require("./pairingApproval.js");
const Friendly = require("./pairingErrorMessages.js");
const Id = require("./identifiers.js");
const Secrets = require("./secrets.js");

/**
 * Pairing codes stay valid for 12 hours AND auto-refresh while the installer
 * keeps polling, so a few minutes of human delay can never kill a pairing
 * (Yaakov 2026-10-11 stability order). Codes are still one-shot: they die
 * the moment pairing succeeds.
 */
const PAIRING_LIFETIME_MS = 12 * 60 * 60 * 1000;

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
		const publicKey = input.devicePublicKey;
		return {
			ok: false,
			error: "invalid_device_public_key",
			message: Friendly.messageFor("invalid_device_public_key"),
			diagnostic: {
				inputKeys: Object.keys(input || {}).sort().slice(0, 24),
				publicKeyType: Buffer.isBuffer(publicKey) ? "buffer" : typeof publicKey,
				publicKeyLength: publicKey == null ? 0 : String(publicKey).length,
				publicKeyFormat: String(publicKey || "").startsWith("rsa-spki-base64url:")
					? "rsa-spki-base64url"
					: String(publicKey || "").includes("BEGIN PUBLIC KEY")
						? "pem"
						: "unknown"
			}
		};
	}
	const deviceId = Id.deviceId(input.deviceId);
	const tunnelName = Id.tunnelName(input.tunnelName);
	if (!deviceId || !tunnelName) {
		return {
			ok: false,
			error: "invalid_device_identity",
			message: Friendly.messageFor("invalid_device_identity")
		};
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
function approvePairing(accountId, userCode, pairingId) {
	let result = {
		ok: false,
		error: "pairing_not_found",
		message: Friendly.messageFor("pairing_not_found")
	};
	mutateStore((store) => {
		// B"H — Yaakov 2026-10-14: If pairingId provided, use it for direct lookup.
		// More reliable than code-only lookup.
		if (pairingId) {
			const normalized = Id.normalizeIdentifier(pairingId);
			const pairing = normalized ? store.tunnelPairings[normalized] : null;
			if (pairing && pairing.state === "pending") {
				// Verify the code matches too (security)
				const codeDigest = Secrets.digest(String(userCode || "").trim().toUpperCase());
				if (pairing.userCodeDigest === codeDigest) {
					pairing.state = "approved";
					pairing.approvedBy = accountId;
					pairing.approvedAt = Date.now();
					result = { ok: true, pairingId: pairing.pairingId };
				}
			}
		} else {
			result = Approval.approveInStore(store, accountId, userCode);
		}
		return store;
	});
	return result;
}

/**
 * B"H — Read-only pairing state for redundancy checks (installer direct poll,
 * agent WS-watch confirmation). Never consumes, never slides expiry, never
 * requires the request secret. Safe for unauthenticated possession-free polling:
 * pairing IDs are unguessable and the response reveals only the state.
 */
function describePairing(pairingId) {
	const normalized = Id.normalizeIdentifier(pairingId);
	if (!normalized) {
		return { ok: false, error: "pairing_not_found" };
	}
	const store = readStore();
	const pairing = store.tunnelPairings[normalized];
	if (!pairing) {
		return { ok: false, error: "pairing_not_found" };
	}
	if (pairing.state === "pending" && pairing.expiresAt <= Date.now()) {
		return { ok: true, state: "expired", expiresAt: pairing.expiresAt };
	}
	return {
		ok: true,
		state: pairing.state,
		expiresAt: pairing.expiresAt
	};
}

/** Returns one encrypted credential envelope to the possessing device. */
function consumePairing(pairingId, requestSecret) {
	let result = {
		ok: false,
		error: "pairing_not_found",
		message: Friendly.messageFor("pairing_not_found")
	};
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
			// Healthy candidate still polling: slide the expiry forward so the
			// pairing code can never die while the installer is running.
			if (pairing.state === "pending") {
				pairing.expiresAt = Date.now() + PAIRING_LIFETIME_MS;
			}
			result = { ok: true, state: pairing.state, expiresAt: pairing.expiresAt };
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
	createPairingRequest,
	describePairing
};
