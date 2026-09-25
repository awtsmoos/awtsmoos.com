//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists hashed OAuth refresh tokens, audience, and Agent Link provenance.
 * @description
 * The Awtsmoos renews every permitted vessel; Awtsmoos.com stores only a hash
 * with bounded lineage, including the protected resource, so refresh can renew
 * the same doorway but never silently migrate authority into another domain.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function dataDir() {
	return path.join(process.env.__awtsdir || process.cwd(), "geelooy", ".data");
}

function storePath() {
	return path.join(dataDir(), "oauth-refresh-tokens.json");
}

function readStore() {
	try {
		return JSON.parse(fs.readFileSync(storePath(), "utf8"));
	} catch (error) {
		return { tokens: {} };
	}
}

function writeStore(store) {
	fs.mkdirSync(dataDir(), { recursive: true });
	fs.writeFileSync(storePath(), JSON.stringify(store, null, 2), "utf8");
}

function hashToken(token) {
	return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function makeRefreshToken() {
	return "awt_refresh_" + crypto.randomBytes(48).toString("base64url");
}

function createRefreshRecord(details) {
	const token = makeRefreshToken();
	const hash = hashToken(token);
	const now = Date.now();
	const store = readStore();
	store.tokens[hash] = {
		hash,
		userId: details.userId,
		clientId: details.clientId,
		scope: details.scope,
		resource: details.resource || "",
		agentLinkId: details.agentLinkId || null,
		createdAt: now,
		lastUsedAt: null,
		expiresAt: now + 30 * 24 * 60 * 60 * 1000,
		revoked: false
	};
	writeStore(store);
	return token;
}

function readRefreshRecord(token) {
	return readStore().tokens[hashToken(token)] || null;
}

function touchRefreshRecord(token) {
	const hash = hashToken(token);
	const store = readStore();
	if (!store.tokens[hash]) return false;
	store.tokens[hash].lastUsedAt = Date.now();
	writeStore(store);
	return true;
}

function revokeRefreshToken(token) {
	const hash = hashToken(token);
	const store = readStore();
	if (!store.tokens[hash]) return false;
	store.tokens[hash].revoked = true;
	store.tokens[hash].revokedAt = Date.now();
	writeStore(store);
	return true;
}

module.exports = {
	createRefreshRecord,
	readRefreshRecord,
	revokeRefreshToken,
	touchRefreshRecord
};
