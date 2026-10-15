// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { mutateStore, readStore } = require("../store.js");
const Approval = require("./pairingApproval.js");
const Binding = require("./bindingStore.js");
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
	} catch (e) {
		// B"H — Yaakov 2026-10-15: NEVER swallow file errors silently.
		// Every failure must surface (standing rule).
		try {
			console.error(`[pairingStore] FATAL: Failed to write pairing file: ${e.message}`);
			console.error(e.stack);
		} catch {}
	}
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

// B"H — 2026-10-14: Safeguarded tunnel credential creation with extensive
// reporting. Yaakov ordered LOTS of safeguards and reporting.
// This creates the tunnelId and encrypted credential envelope during approval.
// If ANY step fails, the pairing is NOT approved (fail fast, no silent broken state).
function createTunnelCredential(pairing, accountId) {
	const report = {
		steps: [],
		ok: false,
		tunnelId: null,
		credentialEnvelope: null,
		error: null
	};
	function logStep(name, ok, detail) {
		const entry = { name, ok, detail: String(detail || "").slice(0, 200), at: new Date().toISOString() };
		report.steps.push(entry);
		// B"H — Report to console for production visibility (Yaakov: LOTS of reporting).
		try {
			console.log(`[pairingStore] credential ${name}: ${ok ? "OK" : "FAIL"} ${entry.detail}`);
		} catch {}
	}

	// SAFEGUARD 1: Validate inputs.
	if (!pairing || !pairing.pairingId) {
		logStep("validate_pairing", false, "missing pairing or pairingId");
		report.error = "invalid_pairing";
		return report;
	}
	if (!accountId) {
		logStep("validate_account", false, "missing accountId");
		report.error = "invalid_account";
		return report;
	}
	if (!pairing.devicePublicKey) {
		logStep("validate_pubkey", false, "missing devicePublicKey");
		report.error = "missing_device_public_key";
		return report;
	}
	logStep("validate_inputs", true, `pairing=${pairing.pairingId} account=${accountId}`);

	// SAFEGUARD 2: Generate credential plaintext (simple token, not JSON).
	// B"H — 2026-10-14: RSA 2048 OAEP SHA256 can only encrypt ~190 bytes.
	// Use a simple random token as the credential plaintext. The relay
	// verifies via digest, and resolves tunnelId/account from the binding.
	// The binding (created below) generates the tunnelId.
	const credentialPlaintext = Secrets.randomToken(32);
	if (!credentialPlaintext || credentialPlaintext.length < 40) {
		logStep("generate_credential", false, "credential generation failed");
		report.error = "credential_generation_failed";
		return report;
	}
	logStep("generate_credential", true, `credential_bytes=${credentialPlaintext.length}`);

	// SAFEGUARD 3: Create binding in the store.
	// B"H — 2026-10-14: The relay's verifyRegistration looks up the binding
	// by tunnelId and compares credential digests. Without the binding,
	// the tunnel can never authenticate. This was the missing piece.
	let binding = null;
	let tunnelId = null;
	try {
		mutateStore(store => {
			binding = Binding.createBinding(store, {
				pairingId: pairing.pairingId,
				ownershipVerifiedAt: new Date().toISOString(),
				pairingProofVersion: 1,
				tunnelName: pairing.tunnelName,
				deviceId: pairing.deviceId,
				ownerAccountId: accountId,
				credential: credentialPlaintext,
				devicePublicKey: pairing.devicePublicKey,
				deviceName: pairing.deviceName,
				platform: pairing.platform
			});
			return store;
		});
	} catch (e) {
		// FALLBACK: If createBinding fails (e.g., 11M store issues),
		// create a minimal binding directly.
		logStep("create_binding", false, `createBinding failed: ${e.message}, trying direct`);
		try {
			tunnelId = `tun_${Secrets.randomToken(18)}`;
			const now = new Date().toISOString();
			mutateStore(store => {
				if (!store.tunnelBindings) store.tunnelBindings = {};
				store.tunnelBindings[tunnelId] = {
					tunnelId,
					tunnelName: String(pairing.tunnelName || "tunnel").slice(0, 80),
					deviceId: String(pairing.deviceId || "device").slice(0, 80),
					ownerAccountId: String(accountId),
					credentialDigest: Secrets.digest(credentialPlaintext),
					devicePublicKey: String(pairing.devicePublicKey || "").trim(),
					deviceName: String(pairing.deviceName || "Tunnel Device").slice(0, 160),
					platform: String(pairing.platform || "unknown").slice(0, 80),
					pairingId: pairing.pairingId,
					ownershipVerifiedAt: now,
					pairingProofVersion: 1,
					keyVersion: 1,
					permissionVersion: 1,
					revocationVersion: 1,
					createdAt: now,
					lastAuthenticatedAt: null,
					revokedAt: null
				};
				return store;
			});
			binding = { tunnelId };
			logStep("create_binding_fallback", true, `direct insert tunnelId=${tunnelId.slice(0, 12)}...`);
		} catch (e2) {
			logStep("create_binding", false, `fallback also failed: ${e2.message}`);
			report.error = "binding_creation_failed";
			return report;
		}
	}
	if (!binding || !binding.tunnelId) {
		// Use the fallback tunnelId if createBinding didn't return one
		if (!tunnelId) {
			logStep("create_binding", false, "binding creation returned no tunnelId");
			report.error = "binding_creation_failed";
			return report;
		}
	} else {
		tunnelId = binding.tunnelId;
	}
	logStep("create_binding", true, `tunnelId=${tunnelId.slice(0, 12)}...`);

	// Use the plaintext for encryption (defined above as credentialPlaintext).
	const credentialJson = credentialPlaintext;

	// SAFEGUARD 4: Parse device public key.
	let publicKeyObj = null;
	try {
		const pubKeyStr = String(pairing.devicePublicKey);
		if (pubKeyStr.startsWith("rsa-spki-base64url:")) {
			const b64url = pubKeyStr.slice("rsa-spki-base64url:".length);
			const der = Buffer.from(b64url, "base64url");
			publicKeyObj = crypto.createPublicKey({ key: der, format: "der", type: "spki" });
			logStep("parse_pubkey", true, "format=rsa-spki-base64url");
		} else if (pubKeyStr.includes("BEGIN PUBLIC KEY")) {
			publicKeyObj = crypto.createPublicKey(pubKeyStr);
			logStep("parse_pubkey", true, "format=pem");
		} else {
			logStep("parse_pubkey", false, "unknown public key format");
			report.error = "unknown_public_key_format";
			return report;
		}
	} catch (e) {
		logStep("parse_pubkey", false, e.message);
		report.error = "public_key_parse_failed";
		return report;
	}

	// SAFEGUARD 5: Encrypt with RSA OAEP SHA256 (matches agent's decrypt).
	let envelope = null;
	try {
		const encrypted = crypto.publicEncrypt({
			key: publicKeyObj,
			oaepHash: "sha256",
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
		}, Buffer.from(credentialJson, "utf8"));
		envelope = encrypted.toString("base64");
	} catch (e) {
		logStep("encrypt", false, e.message);
		report.error = "credential_encrypt_failed";
		return report;
	}
	// SAFEGUARD 6: Validate envelope.
	if (!envelope || envelope.length < 50) {
		logStep("validate_envelope", false, `envelope too short (${(envelope || "").length})`);
		report.error = "credential_envelope_invalid";
		return report;
	}
	logStep("encrypt", true, `envelope_bytes=${envelope.length}`);

	// SUCCESS: All safeguards passed.
	report.ok = true;
	report.tunnelId = tunnelId;
	report.credentialEnvelope = envelope;
	// Store the credential digest for later verification (not the plaintext itself).
	report.tunnelSecretDigest = Secrets.digest(credentialPlaintext);
	logStep("complete", true, `tunnelId=${tunnelId.slice(0, 12)}... envelope=${envelope.length}b`);
	return report;
}

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
	try {
		console.log(`[pairingStore] created pairing=${pairingId} device=${deviceId} tunnel=${tunnelName}`);
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
				// B"H — 2026-10-14: Create tunnel credential BEFORE marking approved.
				// LOTS of safeguards: if credential creation fails, DO NOT approve.
				// This prevents the silent broken state where pairing is approved
				// but the agent gets undefined credential.
				const credReport = createTunnelCredential(pairing, accountId);
				if (!credReport.ok) {
					try {
						console.log(`[pairingStore] APPROVAL BLOCKED pairing=${pairing.pairingId} reason=${credReport.error} steps=${credReport.steps.length}`);
					} catch {}
					return {
						ok: false,
						error: credReport.error || "credential_creation_failed",
						message: Friendly.messageFor(credReport.error || "credential_creation_failed") || "Failed to create tunnel credential",
						diagnostic: {
							pairingId: pairing.pairingId,
							steps: credReport.steps
						}
					};
				}
				// Credential created successfully. Now mark approved and store it.
				pairing.state = "approved";
				pairing.approvedBy = accountId;
				pairing.approvedAt = Date.now();
				pairing.tunnelId = credReport.tunnelId;
				pairing.credentialEnvelope = credReport.credentialEnvelope;
				pairing.tunnelSecretDigest = credReport.tunnelSecretDigest;
				pairing.credentialCreatedAt = Date.now();
				memoryPairings.set(pairing.pairingId, pairing);
				try {
					const all = readPairingFile();
					all[pairing.pairingId] = pairing;
					writePairingFile(all);
				} catch {}
				try {
					console.log(`[pairingStore] APPROVED pairing=${pairing.pairingId} tunnel=${credReport.tunnelId.slice(0, 12)}... account=${accountId}`);
				} catch {}
				return {
					ok: true,
					pairingId: pairing.pairingId,
					tunnelId: credReport.tunnelId,
					credentialCreated: true,
					report: credReport.steps
				};
			}
		}
		// B"H — Yaakov 2026-10-14: Idempotent re-approval. If the same account
		// already approved this pairing (double-submit, retry), return success
		// instead of an error. Only a different account claiming it is a conflict.
		if (pairing && pairing.state === "approved" && pairing.approvedBy === accountId) {
			// SAFEGUARD: Verify credential exists on re-approval.
			if (!pairing.tunnelId || !pairing.credentialEnvelope) {
				try {
					console.log(`[pairingStore] RE-APPROVAL WARNING pairing=${pairing.pairingId} missing credential, recreating`);
				} catch {}
				const credReport = createTunnelCredential(pairing, accountId);
				if (credReport.ok) {
					pairing.tunnelId = credReport.tunnelId;
					pairing.credentialEnvelope = credReport.credentialEnvelope;
					pairing.tunnelSecretDigest = credReport.tunnelSecretDigest;
					try {
						const all = readPairingFile();
						all[pairing.pairingId] = pairing;
						writePairingFile(all);
					} catch {}
					memoryPairings.set(pairing.pairingId, pairing);
				}
			}
			return { ok: true, pairingId: pairing.pairingId, alreadyApproved: true };
		}
		return {
			ok: false,
			error: "pairing_not_found",
			message: Friendly.messageFor("pairing_not_found")
		};
	}
	// Fallback: code-only lookup.
	// B"H — Yaakov 2026-10-15: Search dedicated pairing file FIRST (by userCodeDigest),
	// then legacy 11M store. Manual approval form sends pairingId="" so we must
	// find by code alone.
	let result = {
		ok: false,
		error: "pairing_not_found",
		message: Friendly.messageFor("pairing_not_found")
	};
	const codeDigest = Secrets.digest(String(userCode || "").trim().toUpperCase());
	try {
		ensureMemoryLoaded();
		// Search memory first
		for (const pairing of memoryPairings.values()) {
			if (pairing.userCodeDigest === codeDigest && pairing.state === "pending") {
				// Found by code — approve it directly
				const credReport = createTunnelCredential(pairing, accountId);
				if (credReport.ok) {
					pairing.state = "approved";
					pairing.approvedAt = Date.now();
					pairing.approvedBy = accountId;
					try {
						const all = readPairingFile();
						all[pairing.pairingId] = pairing;
						writePairingFile(all);
					} catch {}
					return { ok: true, pairingId: pairing.pairingId };
				}
				return { ok: false, error: credReport.error || "credential_creation_failed" };
			}
		}
		// Search file
		const fileData = readPairingFile();
		for (const pid of Object.keys(fileData)) {
			const pairing = fileData[pid];
			if (pairing && pairing.userCodeDigest === codeDigest && pairing.state === "pending") {
				const credReport = createTunnelCredential(pairing, accountId);
				if (credReport.ok) {
					pairing.state = "approved";
					pairing.approvedAt = Date.now();
					pairing.approvedBy = accountId;
					fileData[pid] = pairing;
					writePairingFile(fileData);
					memoryPairings.set(pid, pairing);
					return { ok: true, pairingId: pid };
				}
				return { ok: false, error: credReport.error || "credential_creation_failed" };
			}
		}
	} catch {}
	// Legacy fallback: old Approval (11M store, for backwards compat).
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
	if (!pairing) {
		try { console.log(`[pairingStore] consume FAIL pairing=${pairingId} reason=not_found`); } catch {}
		return result;
	}
	const supplied = Secrets.digest(requestSecret);
	if (pairing.expiresAt <= Date.now()) {
		try { console.log(`[pairingStore] consume FAIL pairing=${pairing.pairingId} reason=expired`); } catch {}
		return result;
	}
	if (!Secrets.secureEqual(pairing.requestSecretDigest, supplied)) {
		try { console.log(`[pairingStore] consume FAIL pairing=${pairing.pairingId} reason=bad_secret`); } catch {}
		return result;
	}
	// B"H — Yaakov 2026-10-14: Idempotent retry. If this pairing was already
	// consumed by THIS device (same requestSecret) within the last 5 minutes,
	// return the cached credential instead of "consumed" error. Handles the
	// case where the network failed after consume but before client received.
	if (pairing.state === "consumed" && global.__pairingConsumeCache) {
		const cached = global.__pairingConsumeCache.get(pairing.pairingId);
		if (cached && (Date.now() - cached.consumedAt) < 5 * 60 * 1000) {
			if (Secrets.secureEqual(cached.requestSecretDigest, supplied)) {
				// SAFEGUARD: Verify cached credential is valid before returning.
				if (!cached.tunnelId || !cached.credentialEnvelope) {
					try { console.log(`[pairingStore] consume RETRY FAIL pairing=${pairing.pairingId} reason=cached_credential_invalid`); } catch {}
					return { ok: false, error: "credential_invalid", message: "Cached credential is invalid" };
				}
				try { console.log(`[pairingStore] consume RETRY OK pairing=${pairing.pairingId}`); } catch {}
				return {
					ok: true,
					state: "approved",
					tunnelId: cached.tunnelId,
					credentialEnvelope: cached.credentialEnvelope,
					retried: true
				};
			}
		}
	}
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
	// B"H — 2026-10-14 SAFEGUARD: Verify credential exists BEFORE consuming.
	// If approval didn't create it (old bug), fail with clear error instead of
	// returning undefined to the agent.
	if (!pairing.tunnelId || !pairing.credentialEnvelope) {
		try { console.log(`[pairingStore] consume BLOCKED pairing=${pairing.pairingId} reason=missing_credential (approval did not create it)`); } catch {}
		return {
			ok: false,
			error: "credential_not_created",
			message: "Pairing was approved but no credential was created. Please re-approve.",
			diagnostic: {
				pairingId: pairing.pairingId,
				hasTunnelId: !!pairing.tunnelId,
				hasEnvelope: !!pairing.credentialEnvelope,
				approvedBy: pairing.approvedBy,
				approvedAt: pairing.approvedAt
			}
		};
	}
	pairing.state = "consumed";
	pairing.consumedAt = Date.now();
	result = {
		ok: true,
		state: "approved",
		tunnelId: pairing.tunnelId,
		credentialEnvelope: pairing.credentialEnvelope
	};
	// B"H — Yaakov 2026-10-14: Cache the consumed credential for 5 minutes to
	// allow idempotent retries. If the network fails after consume but before
	// the client receives the response, the retry gets the same credential
	// instead of "consumed" error. Root cause fix for pairing_consumed.
	if (!global.__pairingConsumeCache) global.__pairingConsumeCache = new Map();
	global.__pairingConsumeCache.set(pairing.pairingId, {
		credentialEnvelope: pairing.credentialEnvelope,
		tunnelId: pairing.tunnelId,
		consumedAt: Date.now(),
		requestSecretDigest: pairing.requestSecretDigest
	});
	delete pairing.credentialEnvelope;
	try {
		const all = readPairingFile();
		all[pairing.pairingId] = pairing;
		writePairingFile(all);
	} catch {}
	memoryPairings.set(pairing.pairingId, pairing);
	try { console.log(`[pairingStore] consume OK pairing=${pairing.pairingId} tunnel=${pairing.tunnelId.slice(0, 12)}...`); } catch {}
	return result;
}

module.exports = {
	PAIRING_LIFETIME_MS,
	approvePairing,
	consumePairing,
	createPairingRequest,
	describePairing
};
