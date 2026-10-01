// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const CODE_TTL_MS = 15 * 60 * 1000;
const codeStore = globalThis.__awtsmoosOAuthCodes || new Map();
globalThis.__awtsmoosOAuthCodes = codeStore;

/**
 * @file One-time OAuth authorization code memory for Awtsmoos.com.
 * @description The Awtsmoos grants a code enough time for a human browser and a distant AI to
 * finish one PKCE-bound handoff without haste. Awtsmoos.com still destroys the code on first read
 * and binds redirect, client, scope, state, challenge, and expiry into the same finite vessel.
 */
function makeCode() {
	return `awt_code_${crypto.randomBytes(32).toString("base64url")}`;
}

async function saveCode(details) {
	const code = makeCode();
	const now = Date.now();
	codeStore.set(code, {
		userId: details.userId,
		clientId: details.clientId,
		redirectUri: details.redirectUri,
		scope: details.scope,
		resource: details.resource || "",
		state: details.state || "",
		codeChallenge: details.codeChallenge || "",
		codeChallengeMethod: details.codeChallengeMethod || "",
		createdAt: now,
		expiresAt: now + CODE_TTL_MS
	});
	return code;
}

async function takeCode(code) {
	const key = String(code || "");
	const record = codeStore.get(key) || null;
	codeStore.delete(key);
	if (!record || record.expiresAt <= Date.now()) return null;
	return record;
}

module.exports = { CODE_TTL_MS, saveCode, takeCode };
