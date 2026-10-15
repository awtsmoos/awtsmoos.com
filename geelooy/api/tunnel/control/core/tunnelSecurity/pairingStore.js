// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { mutateStore, readStore } = require("../store.js");
const Approval = require("./pairingApproval.js");
const Friendly = require("./pairingErrorMessages.js");
const Id = require("./identifiers.js");
const Secrets = require("./secrets.js");
const Paths = require("../storePaths.js");

// B"H — Yaakov 2026-10-14: Dedicated pairing file (not the 11M store).
// The 11M tunnel-control.json is too large to parse reliably on every request.
// Pairings go in a small dedicated file: tunnel-pairings.json
function pairingFilePath() {
	const dir = path.dirname(Paths.storePath());
	return path.join(dir, "tunnel-pairings.json");
}

function readPairingFile() {
	try {
		const data = fs.readFileSync(pairingFilePath(), "utf8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}

function writePairingFile(pairings) {
	try {
		const dir = path.dirname(pairingFilePath());
		fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
		const tmp = pairingFilePath() + ".tmp." + process.pid;
		fs.writeFileSync(tmp, JSON.stringify(pairings), "utf8");
		fs.renameSync(tmp, pairingFilePath());
	} catch {}
}

// B"H — In-memory cache, loaded from file on first use.
const memoryPairings = new Map();
let memoryLoaded = false;
function ensureMemoryLoaded() {
	if (memoryLoaded) return;
	memoryLoaded = true;
	try {
		const fileData = readPairingFile();
		for (const [k, v] of Object.entries(fileData)) {
			memoryPairings.set(k, v);
		}
	} catch {}
}

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
	const pairingData = {
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
	// B"H — Store in dedicated file (small, fast) and memory.
	// Do NOT use the 11M shared store — it's too slow to parse on every request.
	ensureMemoryLoaded();
	memoryPairings.set(pairingId, pairingData);
	try {
		const all = readPairingFile();
		all[pairingId] = pairingData;
		writePairingFile(all);
	} catch {}
	return { ok: true, pairingId, requestSecret, userCode, expiresAt };
}

/** Approves one matching pending code for the verified account. */
function approvePairing(accountId, userCode, pairingId) {
	// B"H — Use dedicated file (not 11M store).
	ensureMemoryLoaded();
	if (pairingId) {
		const normalized = Id.normalizeIdentifier(pairingId);
		let pairing = memoryPairings.get(normalized) || memoryPairings.get(pairingId);
		if (!pairing) {
			try {
				const fileData = readPairingFile();
				pairing = fileData[normalized] || fileData[pairingId];
			} catch {}
		}
		if (pairing && pairing.state === "pending") {
			const codeDigest = Secrets.digest(String(userCode || "").trim().toUpperCase());
			if (pairing.userCodeDigest === codeDigest) {
				pairing.state = "approved";
				pairing.approvedBy = accountId;
				pairing.approvedAt = Date.now();
				memoryPairings.set(pairing.pairingId, pairing);
				try {
					const all = readPairingFile();
					all[pairing.pairingId] = pairing;
					writePairingFile(all);
				} catch {}
				return { ok: true, pairingId: pairing.pairingId };
			}
		}
		// B"H — Yaakov 2026-10-14: Idempotent re-approval. If the same account
		// already approved this pairing (double-submit, retry), return success
		// instead of an error. Only a different account claiming it is a conflict.
		if (pairing && pairing.state === "approved" && pairing.approvedBy === accountId) {
			return { ok: true, pairingId: pairing.pairingId, alreadyApproved: true };
		}
		return {
			ok: false,
			error: "pairing_not_found",
			message: Friendly.messageFor("pairing_not_found")
		};
	}
	// Fallback: code-only lookup via old Approval (for backwards compat).
	let result = {
		ok: false,
		error: "pairing_not_found",
		message: Friendly.messageFor("pairing_not_found")
	};
	mutateStore((store) => {
		result = Approval.approveInStore(store, accountId, userCode);
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
	// B"H — Check memory first, then dedicated file (NOT the 11M store).
	ensureMemoryLoaded();
	let pairing = memoryPairings.get(normalized) || memoryPairings.get(pairingId);
	if (!pairing) {
		try {
			const fileData = readPairingFile();
			pairing = fileData[normalized] || fileData[pairingId];
			if (pairing) memoryPairings.set(pairing.pairingId, pairing);
		} catch {}
	}
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
	// B"H — Use dedicated file (not 11M store).
	ensureMemoryLoaded();
	const normalized = Id.normalizeIdentifier(pairingId);
	let pairing = memoryPairings.get(normalized) || memoryPairings.get(pairingId);
	if (!pairing) {
		try {
			const fileData = readPairingFile();
			pairing = fileData[normalized] || fileData[pairingId];
			if (pairing) memoryPairings.set(pairing.pairingId, pairing);
		} catch {}
	}
	if (!pairing) return result;
	const supplied = Secrets.digest(requestSecret);
	if (pairing.expiresAt <= Date.now()) return result;
	if (!Secrets.secureEqual(pairing.requestSecretDigest, supplied)) return result;
	if (pairing.state !== "approved") {
		if (pairing.state === "pending") {
			pairing.expiresAt = Date.now() + PAIRING_LIFETIME_MS;
			try {
				const all = readPairingFile();
				all[pairing.pairingId] = pairing;
				writePairingFile(all);
			} catch {}
		}
		result = { ok: true, state: pairing.state, expiresAt: pairing.expiresAt };
		return result;
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
	try {
		const all = readPairingFile();
		all[pairing.pairingId] = pairing;
		writePairingFile(all);
	} catch {}
	memoryPairings.set(pairing.pairingId, pairing);
	return result;
}

module.exports = {
	PAIRING_LIFETIME_MS,
	approvePairing,
	consumePairing,
	createPairingRequest,
	describePairing
};
