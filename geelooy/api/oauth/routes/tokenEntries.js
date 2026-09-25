//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Evolves every OAuth grant record into current Awtsmoos token authority.
 * @description
 * The Awtsmoos gives one living scope covenant after callback, device, or refresh;
 * Awtsmoos.com signs the protected resource into the same entry so audience joins
 * user, client, and scope as immutable evidence at every guarded threshold.
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

function authorizationCodeEntry(record, client, resource = record.resource || "") {
	return evolvedEntry(client, {
		userId: record.userId,
		scope: record.scope || client.defaultScope,
		...(resource ? { resource } : {})
	});
}

function deviceCodeEntry(record, client) {
	return evolvedEntry(client, {
		userId: record.userId,
		scope: record.scope || client.defaultScope,
		...(record.resource ? { resource: record.resource } : {}),
		authorizedFrom: "device_code"
	});
}

function refreshTokenEntry(record, client, resource = record.resource || "") {
	return evolvedEntry(client, {
		userId: record.userId,
		clientId: record.clientId || client.id,
		scope: record.scope || client.defaultScope,
		...(resource ? { resource } : {}),
		refreshedFrom: "refresh_token"
	});
}

module.exports = {
	authorizationCodeEntry,
	deviceCodeEntry,
	evolvedEntry,
	refreshTokenEntry
};
