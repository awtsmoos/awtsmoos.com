// B"H
// Boruch Hashem
// Blessed is He

const ScopeEvolution = require("../core/scopeEvolution.js");

function authorizationCodeEntry(record, client) {
	return ScopeEvolution.evolveEntry(client, {
		kind: "oauth_access",
		userId: record.userId,
		clientId: client.id,
		scope: record.scope || client.defaultScope,
		createdAt: Date.now()
	});
}

function refreshTokenEntry(record, client) {
	return ScopeEvolution.evolveEntry(client, {
		kind: "oauth_access",
		userId: record.userId,
		clientId: record.clientId,
		scope: record.scope,
		createdAt: Date.now(),
		refreshedFrom: "refresh_token"
	});
}

module.exports = {
	authorizationCodeEntry,
	refreshTokenEntry
};
