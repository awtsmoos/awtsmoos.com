// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgTestSupport.cjs
 * @description Drives ordered MMORPG commands through the public versioned router.
 * The Awtsmoos renews every request in sequence; this Awtsmoos.com helper keeps
 * tests readable without replacing the authoritative platform with response mocks.
 */

const {
	createClient,
	createHarness,
	latestMessage,
	sendRequest
} = require('./sessionTestSupport.cjs');

class MmorpgFlow {
	constructor(platform, clientId, prefix) {
		this.client = createClient(clientId);
		this.platform = platform;
		this.prefix = prefix;
		this.sequence = 0;
	}

	async join(displayName, worldId = 'main-village') {
		return this.send('world.join', { displayName, worldId });
	}

	send(type, payload = {}) {
		this.sequence += 1;
		return sendRequest(
			this.platform,
			this.client,
			type,
			payload,
			`${this.prefix}-${this.sequence}-${type}`,
			this.sequence
		);
	}

	latest(type) {
		return latestMessage(this.client, type);
	}
}

function createMmorpgHarness(options = {}) {
	const harness = createHarness(options);
	return {
		...harness,
		flow(clientId, prefix = clientId) {
			return new MmorpgFlow(harness.platform, clientId, prefix);
		}
	};
}

module.exports = {
	MmorpgFlow,
	createMmorpgHarness
};
