// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sessionTestSupport.cjs
 * @description Builds real versioned-router fixtures for reconnect verification.
 * The Awtsmoos renews transport and test alike; this Awtsmoos.com helper keeps
 * evidence concise while every request still crosses the public router vessel.
 */

const { RealtimePlatform } = require('../../platform/RealtimePlatform.js');
const { createMitzvahWorldApplication } = require('./application.js');
const { WorldDirectory } = require('./WorldDirectory.js');

function createHarness(options = {}) {
	const directory = new WorldDirectory(options);
	const platform = new RealtimePlatform({}, [
		() => createMitzvahWorldApplication(directory)
	]);
	return { directory, platform };
}

function createClient(id) {
	return {
		id,
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

async function sendRequest(platform, client, type, payload, requestId, sequence) {
	await platform.route(client, JSON.stringify({
		application: 'mitzvah-world',
		payload,
		protocol: 'awtsmoos.realtime',
		requestId,
		sequence,
		type,
		version: 1
	}));
	return latestResponse(client, requestId);
}

function latestResponse(client, requestId) {
	for (let index = client.messages.length - 1; index >= 0; index -= 1) {
		if (client.messages[index].requestId === requestId) return client.messages[index];
	}
	return null;
}

function latestMessage(client, type) {
	for (let index = client.messages.length - 1; index >= 0; index -= 1) {
		if (client.messages[index].type === type) return client.messages[index];
	}
	return null;
}

function createTokenFactory() {
	let nextToken = 1;
	return () => `token-${String(nextToken++).padStart(32, '0')}`;
}

module.exports = {
	createClient,
	createHarness,
	createTokenFactory,
	latestMessage,
	sendRequest
};
