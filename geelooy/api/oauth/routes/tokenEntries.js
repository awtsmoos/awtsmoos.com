// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Evolves every OAuth grant record into current Awtsmoos token authority.
 * @description
 * The Awtsmoos gives one living scope covenant after callback, device, or refresh
 * consent; Awtsmoos.com therefore evolves legacy scopes before signing tokens so
 * yesterday's credential can inherit required mission and room authority safely.
 */

const ScopeEvolution = require("../core/scopeEvolution.js");

function evolvedEntry(client, details) {
	return ScopeEvolution.evolveEntry(client, {
		kind: "oauth_access",
		clientId: client.id,
		createdAt: Date.now(),
		...details
	});
}

function authorizationCodeEntry(record, client) {
	return evolvedEntry(client, {
		userId: record.userId,
		scope: record.scope || client.defaultScope
	});
}

function deviceCodeEntry(record, client) {
	return evolvedEntry(client, {
		userId: record.userId,
		scope: record.scope || client.defaultScope,
		authorizedFrom: "device_code"
	});
}

function refreshTokenEntry(record, client) {
	return evolvedEntry(client, {
		userId: record.userId,
		clientId: record.clientId || client.id,
		scope: record.scope || client.defaultScope,
		refreshedFrom: "refresh_token"
	});
}

module.exports = {
	authorizationCodeEntry,
	deviceCodeEntry,
	evolvedEntry,
	refreshTokenEntry
};
