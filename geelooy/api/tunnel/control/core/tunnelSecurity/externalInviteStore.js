// B"H
// Boruch Hashem
// Blessed is He

const { mutateStore } = require("../store.js");
const { createApiKeyRecord } = require("../apiKeyStore.js");
const Secrets = require("./secrets.js");

/**
 * @file One-time invite links for external AI agents (Yaakov 2026-10-12).
 * @description
 * The Awtsmoos opens one small, well-lit door for strangers instead of asking
 * them to carry a heavy prompt. Awtsmoos.com lets an authenticated owner mint
 * a short single-use invite link; any agent that opens it redeems one scoped
 * API key, and the code dies the instant it is used.
 */

// Unambiguous alphabet: no 0/O, 1/I/L.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 12;
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_SCOPES = ["tunnel.read", "tunnel.write"];
const VALID_SCOPE = /^[a-z][a-z0-9._-]{0,47}$/;

function makeCode() {
	const bytes = require("node:crypto").randomBytes(CODE_LENGTH);
	let code = "";
	for (const byte of bytes) {
		code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
	}
	return code;
}

function normalizeScopes(scopes) {
	const list = String(scopes || "")
		.split(/[\s,]+/)
		.filter(Boolean)
		.filter(scope => VALID_SCOPE.test(scope));
	const unique = [...new Set(list)];
	return unique.length ? unique.slice(0, 16) : [...DEFAULT_SCOPES];
}

/**
 * Mints one single-use invite link for the authenticated owner.
 * Returns the code in cleartext exactly once; only its digest is stored.
 */
function createInvite(accountId, input = {}) {
	if (!accountId) {
		return { ok: false, error: "not_authenticated" };
	}
	const label = String(input.label || "External agent").slice(0, 120);
	const scopes = normalizeScopes(input.scopes);
	const ttlMs = Math.min(
		Math.max(Number(input.ttlMinutes || 60) * 60 * 1000, 60 * 1000),
		MAX_TTL_MS
	);
	const code = makeCode();
	const digest = Secrets.digest(code);
	const now = Date.now();
	mutateStore(store => {
		store.externalAgentInvites = store.externalAgentInvites || {};
		store.externalAgentInvites[digest] = {
			digest,
			accountId: String(accountId),
			label,
			scopes,
			state: "pending",
			createdAt: now,
			expiresAt: now + ttlMs
		};
		return store;
	});
	return {
		ok: true,
		code,
		url: `https://awtsmoos.com/tunnel/connect?code=${code}`,
		label,
		scopes,
		expiresAt: now + ttlMs
	};
}

/** Describes one invite without consuming it (for the connect page). */
function describeInvite(code) {
	const digest = Secrets.digest(String(code || "").trim().toUpperCase());
	let found = null;
	mutateStore(store => {
		const invites = store.externalAgentInvites || {};
		const invite = invites[digest];
		if (invite && invite.state === "pending" && invite.expiresAt > Date.now()) {
			found = {
				label: invite.label,
				scopes: invite.scopes,
				expiresAt: invite.expiresAt
			};
		}
		return store;
	});
	if (!found) {
		return { ok: false, error: "invite_not_found" };
	}
	return { ok: true, ...found };
}

/**
 * Redeems one invite code for a scoped API key. Single-use: the code dies here.
 * The raw key is returned exactly once and never stored in cleartext.
 */
function redeemInvite(code, input = {}) {
	const normalized = String(code || "").trim().toUpperCase();
	if (!/^[A-Z2-9]{12}$/.test(normalized)) {
		return { ok: false, error: "invite_not_found" };
	}
	const digest = Secrets.digest(normalized);
	let invite = null;
	mutateStore(store => {
		const invites = store.externalAgentInvites || {};
		const record = invites[digest];
		if (!record || record.state !== "pending" || record.expiresAt <= Date.now()) {
			return store;
		}
		record.state = "consumed";
		record.consumedAt = Date.now();
		record.agentName = String(input.agentName || "external-agent").slice(0, 120);
		invite = { ...record };
		return store;
	});
	if (!invite) {
		return { ok: false, error: "invite_not_found" };
	}
	const made = createApiKeyRecord({
		userId: invite.accountId,
		name: `External agent: ${invite.agentName} (${invite.label})`.slice(0, 160),
		scopes: invite.scopes,
		rateLimitPerMinute: 60,
		bytesPerDay: 50000000
	});
	return {
		ok: true,
		apiKey: made.rawKey,
		keyId: made.key && made.key.keyId,
		scopes: invite.scopes,
		label: invite.label,
		agentName: invite.agentName
	};
}

module.exports = {
	createInvite,
	describeInvite,
	redeemInvite,
	DEFAULT_TTL_MS
};
