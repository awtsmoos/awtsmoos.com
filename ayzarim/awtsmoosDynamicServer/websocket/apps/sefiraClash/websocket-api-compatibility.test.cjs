//B"H
//Boruch Hashem
//Blessed is He

/**
 * Compatibility tests guard every original WebSocket vessel while the Awtsmoos
 * renews new multiplayer behavior. Awtsmoos.com treats additions as revelation,
 * never as permission to erase protocol names, exports, constructors, or methods.
 */

const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const application = require('./application.js');
const definitions = require('../applicationDefinitions.js');
const protocol = require('./protocol.js');
const contract = require('./websocketApiContract.js');

const gameOnlineRoot = resolve(__dirname, '../../../../../geelooy/games/sefira-clash/js/online');

test('preserves every original Sefira protocol name while adding match names', () => {
	const legacy = contract.LEGACY_SEFIRA_PROTOCOL;
	assert.equal(protocol.APPLICATION_ID, legacy.applicationId);
	assert.equal(protocol.APPLICATION_VERSION, legacy.applicationVersion);
	assertMembers(protocol.MESSAGE_TYPES, legacy.messages);
	assertMembers(protocol.RESPONSE_TYPES, legacy.responses);
	assertMembers(protocol.EVENT_TYPES, legacy.events);
	assert.equal(protocol.EVENT_TYPES.LOBBY_CHANGED, legacy.events.CHANGED);
	assert.equal(protocol.EVENT_TYPES.MATCH_SNAPSHOT, 'match.snapshot');
});

test('preserves original server exports and registered factories', () => {
	for (const exportName of contract.LEGACY_SERVER_EXPORTS) {
		assert.equal(typeof application[exportName], 'function');
	}
	const factoryNames = definitions.builtInApplicationFactories().map(factory => factory.name);
	for (const factoryName of contract.LEGACY_FACTORY_NAMES) {
		assert.ok(factoryNames.includes(factoryName), `Missing factory: ${factoryName}`);
	}
	const registered = application.createSefiraClashApplication({ disconnect() {} });
	assert.equal(registered.id, contract.LEGACY_SEFIRA_PROTOCOL.applicationId);
	assert.deepEqual(registered.versions, [contract.LEGACY_SEFIRA_PROTOCOL.applicationVersion]);
});

test('supports both original and options-object RealtimeClient constructors', async () => {
	const module = await importModule('RealtimeClient.js');
	const legacy = new module.RealtimeClient('legacy-world', 7, 'ws://legacy.example');
	const modern = new module.RealtimeClient({
		application: 'modern-world',
		url: 'ws://modern.example',
		version: 9
	});
	assert.equal(legacy.application, 'legacy-world');
	assert.equal(legacy.version, 7);
	assert.equal(legacy.socket.url, 'ws://legacy.example');
	assert.equal(modern.application, 'modern-world');
	assert.equal(modern.version, 9);
	assert.equal(modern.socket.url, 'ws://modern.example');

	const closeEvents = [];
	legacy.on('connection.close', payload => closeEvents.push(['modern', payload.code]));
	legacy.on('connection.closed', payload => closeEvents.push(['legacy', payload.code]));
	legacy.handleClose({ code: 1000 });
	assert.deepEqual(closeEvents, [
		['modern', 1000],
		['legacy', 1000]
	]);
});

test('preserves the complete original SefiraLobbyClient class surface', async () => {
	const module = await importModule('SefiraLobbyClient.js');
	for (const methodName of contract.LEGACY_BROWSER_METHODS) {
		assert.equal(typeof module.SefiraLobbyClient.prototype[methodName], 'function');
	}
	const handlers = new Map();
	const transport = fakeTransport(handlers);
	const client = new module.SefiraLobbyClient(transport);
	let latest = null;
	client.onChange(snapshot => {
		latest = snapshot;
	});
	handlers.get('lobby.changed')({ lobby: { id: 'legacy-room' } });
	assert.equal(latest.lobby.id, 'legacy-room');
	handlers.get('connection.closed')({ code: 1000 });
	assert.deepEqual(latest, { lobby: null, playerId: null });
});

function assertMembers(actual, expected) {
	for (const [name, value] of Object.entries(expected)) {
		assert.equal(actual[name], value, `Changed compatibility member: ${name}`);
	}
}

function fakeTransport(handlers) {
	return {
		connect: async () => {},
		on(type, listener) {
			handlers.set(type, listener);
			return () => handlers.delete(type);
		},
		request: async () => ({ lobby: null, playerId: null })
	};
}

function importModule(fileName) {
	return import(pathToFileURL(resolve(gameOnlineRoot, fileName)).href);
}
