//B"H
//Boruch Hashem
//Blessed is He

/**
 * This manifest remembers the original public vessels while the Awtsmoos renews
 * their implementation. Awtsmoos.com may append new lights, but these established
 * protocol names, exports, factories, and browser methods must never disappear.
 */

const LEGACY_SEFIRA_PROTOCOL = Object.freeze({
	applicationId: 'sefira-clash',
	applicationVersion: 1,
	events: Object.freeze({
		CHANGED: 'lobby.changed'
	}),
	messages: Object.freeze({
		CREATE: 'lobby.create',
		JOIN: 'lobby.join',
		LEAVE: 'lobby.leave',
		SNAPSHOT: 'lobby.snapshot',
		UPDATE: 'lobby.update'
	}),
	responses: Object.freeze({
		CREATED: 'lobby.created',
		JOINED: 'lobby.joined',
		LEFT: 'lobby.left',
		SNAPSHOT: 'lobby.snapshot',
		UPDATED: 'lobby.updated'
	})
});

const LEGACY_SERVER_EXPORTS = Object.freeze(['createSefiraClashApplication', 'handleLobbyRequest']);

const LEGACY_BROWSER_METHODS = Object.freeze([
	'applyLobby',
	'applySession',
	'bindTransport',
	'clearSession',
	'connect',
	'create',
	'emit',
	'join',
	'leave',
	'onChange',
	'refresh',
	'snapshot',
	'update'
]);

const LEGACY_FACTORY_NAMES = Object.freeze([
	'createAwtsmoosCoreApplication',
	'createAwtsmoosSocialApplication',
	'createSefiraClashApplication'
]);

module.exports = {
	LEGACY_BROWSER_METHODS,
	LEGACY_FACTORY_NAMES,
	LEGACY_SEFIRA_PROTOCOL,
	LEGACY_SERVER_EXPORTS
};
