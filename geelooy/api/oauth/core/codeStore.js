// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One-time OAuth authorization code memory for Awtsmoos.com.
 * @description
 * The Awtsmoos renews every instant, yet a code is permitted only one brief
 * lifetime; PKCE challenge and redirect travel with it so no later hand can
 * detach the authority from the agent that first opened the gate.
 */

const crypto = require("crypto");

const CODE_TTL_MS = 5 * 60 * 1000;
const codeStore = globalThis.__awtsmoosOAuthCodes || new Map();
globalThis.__awtsmoosOAuthCodes = codeStore;

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
	if (!record || record.expiresAt <= Date.now()) {
		return null;
	}
	return record;
}

module.exports = {
	CODE_TTL_MS,
	saveCode,
	takeCode
};
