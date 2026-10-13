// B"H
// Boruch Hashem
// Blessed is He

const { mutateStore } = require("../store.js");
const { createApiKeyRecord } = require("../apiKeyStore.js");
const Secrets = require("./secrets.js");

/**
 * @file Device-flow login for headless tunnel installs (Yaakov 2026-10-12).
 * @description
 * The Awtsmoos lets a browserless box prove itself without a browser.
 * Awtsmoos.com issues a short user code the installer prints; the owner
 * approves it on their phone; the installer polls until the box is bound
 * to the owner's account. Device secrets are high-entropy, digest-only,
 * single-use, and expire in minutes. Polling is rate-limited by interval.
 */

// Unambiguous alphabet: no 0/O, 1/I/L.
const USER_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const USER_CODE_LENGTH = 8;
const DEVICE_CODE_BYTES = 32;
const TTL_MS = 10 * 60 * 1000; // 10 minutes
const POLL_INTERVAL_SECONDS = 5;
const MAX_POLL_ATTEMPTS = Math.floor(TTL_MS / 1000 / POLL_INTERVAL_SECONDS);
const TUNNEL_SCOPES = ["tunnel.read", "tunnel.write", "tunnel.pair"];

function makeUserCode() {
	const bytes = require("node:crypto").randomBytes(USER_CODE_LENGTH);
	let code = "";
	for (const byte of bytes) {
		code += USER_CODE_ALPHABET[byte % USER_CODE_ALPHABET.length];
	}
	return code.slice(0, 4) + "-" + code.slice(4);
}

function normalizeUserCode(code) {
	return String(code || "").trim().toUpperCase().replace(/[^A-Z2-9]/g, "");
}

/**
 * Starts one device-login request. Public — no auth needed to begin.
 * Returns the polling secret (device code) exactly once.
 */
function createDeviceLogin(input = {}) {
	const now = Date.now();
	const deviceCode = Secrets.randomToken(DEVICE_CODE_BYTES);
	const userCode = makeUserCode();
	const digest = Secrets.digest(deviceCode);
	const userDigest = Secrets.digest(normalizeUserCode(userCode));
	mutateStore(store => {
		store.deviceLogins = store.deviceLogins || {};
		store.deviceLogins[digest] = {
			digest,
			userDigest,
			userCode,
			tunnelId: String(input.tunnelId || "").slice(0, 160),
			deviceId: String(input.deviceId || "").slice(0, 160),
			deviceName: String(input.deviceName || "headless box").slice(0, 160),
			state: "pending",
			accountId: null,
			apiKey: null,
			keyId: null,
			createdAt: now,
			expiresAt: now + TTL_MS,
			approvedAt: null,
			polledAt: 0,
			pollCount: 0
		};
		return store;
	});
	return {
		ok: true,
		deviceCode,
		userCode,
		verificationUrl: "https://awtsmoos.com/tunnel/device",
		verificationUrlWithCode: `https://awtsmoos.com/tunnel/device?code=${encodeURIComponent(userCode)}`,
		expiresIn: Math.floor(TTL_MS / 1000),
		interval: POLL_INTERVAL_SECONDS
	};
}

/** Public description for the phone approval page (no secrets). */
function describeByUserCode(userCode) {
	const userDigest = Secrets.digest(normalizeUserCode(userCode));
	let found = null;
	mutateStore(store => {
		const logins = store.deviceLogins || {};
		for (const digest of Object.keys(logins)) {
			const login = logins[digest];
			if (login.userDigest === userDigest &&
				login.state === "pending" &&
				login.expiresAt > Date.now()) {
				found = {
					userCode: login.userCode,
					tunnelId: login.tunnelId,
					deviceId: login.deviceId,
					deviceName: login.deviceName,
					expiresAt: login.expiresAt
				};
				break;
			}
		}
		return store;
	});
	if (!found) {
		return { ok: false, error: "login_not_found" };
	}
	return { ok: true, ...found };
}

/**
 * Owner approves a pending login. Authenticated only (checked by the route).
 * Mints one scoped API key for the box and binds tunnel → account.
 */
function approveByUserCode(userCode, accountId) {
	if (!accountId) {
		return { ok: false, error: "not_authenticated" };
	}
	const userDigest = Secrets.digest(normalizeUserCode(userCode));
	let login = null;
	mutateStore(store => {
		const logins = store.deviceLogins || {};
		for (const digest of Object.keys(logins)) {
			const record = logins[digest];
			if (record.userDigest === userDigest &&
				record.state === "pending" &&
				record.expiresAt > Date.now()) {
				record.state = "approved";
				record.accountId = String(accountId);
				record.approvedAt = Date.now();
				login = { ...record };
				break;
			}
		}
		return store;
	});
	if (!login) {
		return { ok: false, error: "login_not_found" };
	}
	const made = createApiKeyRecord({
		userId: String(accountId),
		name: `Tunnel device login: ${login.deviceName} (${login.tunnelId || "unknown tunnel"})`.slice(0, 160),
		scopes: [...TUNNEL_SCOPES],
		rateLimitPerMinute: 120,
		bytesPerDay: 500000000
	});
	mutateStore(store => {
		const record = (store.deviceLogins || {})[login.digest];
		if (record) {
			record.apiKey = made.rawKey;
			record.keyId = made.key && made.key.keyId;
		}
		return store;
	});
	return {
		ok: true,
		tunnelId: login.tunnelId,
		deviceName: login.deviceName
	};
}

/** Owner denies a pending login. */
function denyByUserCode(userCode, accountId) {
	if (!accountId) {
		return { ok: false, error: "not_authenticated" };
	}
	const userDigest = Secrets.digest(normalizeUserCode(userCode));
	let denied = false;
	mutateStore(store => {
		const logins = store.deviceLogins || {};
		for (const digest of Object.keys(logins)) {
			const record = logins[digest];
			if (record.userDigest === userDigest && record.state === "pending") {
				record.state = "denied";
				denied = true;
				break;
			}
		}
		return store;
	});
	return denied ? { ok: true } : { ok: false, error: "login_not_found" };
}

/**
 * The box polls this with its device code. Rate-limited: at most one
 * poll per POLL_INTERVAL_SECONDS; faster polling gets a slow_down reply.
 * On approval the API key is returned exactly once, then consumed.
 */
function pollStatus(deviceCode) {
	const digest = Secrets.digest(String(deviceCode || ""));
	const now = Date.now();
	let outcome = { ok: false, error: "login_not_found" };
	mutateStore(store => {
		const record = (store.deviceLogins || {})[digest];
		if (!record) {
			return store;
		}
		if (record.state === "consumed") {
			outcome = { ok: false, error: "login_not_found" };
			return store;
		}
		if (record.expiresAt <= now && record.state === "pending") {
			record.state = "expired";
		}
		if (now - record.polledAt < POLL_INTERVAL_SECONDS * 1000) {
			outcome = { ok: true, status: "slow_down", interval: POLL_INTERVAL_SECONDS };
			return store;
		}
		record.polledAt = now;
		record.pollCount += 1;
		if (record.state === "pending") {
			outcome = { ok: true, status: "pending", interval: POLL_INTERVAL_SECONDS };
		} else if (record.state === "approved" && record.apiKey) {
			outcome = {
				ok: true,
				status: "approved",
				apiKey: record.apiKey,
				keyId: record.keyId,
				accountId: record.accountId,
				tunnelId: record.tunnelId,
				scopes: [...TUNNEL_SCOPES]
			};
			record.apiKey = null; // one-time pickup
			record.state = "consumed";
			record.consumedAt = now;
		} else {
			outcome = { ok: true, status: record.state };
		}
		return store;
	});
	return outcome;
}

module.exports = {
	createDeviceLogin,
	describeByUserCode,
	approveByUserCode,
	denyByUserCode,
	pollStatus,
	POLL_INTERVAL_SECONDS,
	MAX_POLL_ATTEMPTS
};
