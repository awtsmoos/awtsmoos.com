// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const ScopeEvolution = require("./scopeEvolution.js");

function base64Url(value) {
	return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload, secret) {
	return crypto
		.createHmac("sha256", String(secret))
		.update(payload)
		.digest("hex");
}

function makeAccessToken(entry, secret, expiresIn) {
	const payload = [
		"B\"H",
		base64Url({
			entry,
			zman: Date.now(),
			hoshufuh: { expiresIn }
		})
	].join(".");
	return `${payload}.${sign(payload, secret)}`;
}

function buildTokenBody(client, entry, secret, refreshToken) {
	const evolvedEntry = ScopeEvolution.evolveEntry(client, entry);
	const expiresIn = client.accessTokenSeconds || 30 * 24 * 60 * 60;
	const body = {
		access_token: makeAccessToken(evolvedEntry, secret, expiresIn),
		token_type: "Bearer",
		expires_in: expiresIn,
		scope: evolvedEntry.scope
	};
	if (refreshToken) {
		body.refresh_token = refreshToken;
	}
	return {
		body,
		entry: evolvedEntry
	};
}

module.exports = {
	buildTokenBody,
	makeAccessToken
};
