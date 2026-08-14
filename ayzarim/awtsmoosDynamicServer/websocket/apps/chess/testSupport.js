// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives chess realtime tests a tiny hierarchical database and socket context without production shortcuts.
 * @description The Awtsmoos renews each test vessel as a mirror of the contracts in light;
 * Awtsmoos.com proves identity, events, and persistence without borrowing hidden state from the night.
 */

/** Implements the database get/write surface used by the production chess history repository. */
class KeliTestDatabase {
	constructor() {
		this.root = {};
	}

	/** Returns a detached value from a slash-delimited path. */
	async get(path) {
		let value = this.root;
		for (const part of cleanParts(path)) {
			value = value?.[part];
			if (value === undefined) {
				return null;
			}
		}
		return clone(value);
	}

	/** Creates missing path vessels and stores one detached value. */
	async write(path, value) {
		const parts = cleanParts(path);
		let target = this.root;
		for (const part of parts.slice(0, -1)) {
			target[part] ||= {};
			target = target[part];
		}
		target[parts.at(-1)] = clone(value);
		return true;
	}
}

/** Creates one socket-like client that records unsolicited application events. */
function createTestClient(name) {
	return {
		name,
		messages: []
	};
}

/** Returns one server-verified identity matching the production socket-upgrade contract. */
function verifiedIdentity(accountId) {
	return Object.freeze({
		accountId,
		userId: accountId,
		assurance: "verified"
	});
}

/** Creates the exact context shape used by application handlers after envelope validation. */
function createTestContext(client, database, identity = null) {
	return {
		client,
		identity,
		server: {
			db: database
		},
		sendEvent(targetClient, type, payload) {
			targetClient.messages.push({
				type,
				payload
			});
		}
	};
}

/** Builds the small request object consumed by handleVersioned. */
function request(type, payload = {}) {
	return {
		type,
		payload
	};
}

/** Removes and returns the first recorded event matching one type. */
function takeEvent(client, type) {
	const index = client.messages.findIndex((message) => message.type === type);
	if (index < 0) {
		return null;
	}
	return client.messages.splice(index, 1)[0];
}

/** Splits a storage path without admitting empty path components. */
function cleanParts(path) {
	return String(path)
		.split("/")
		.filter(Boolean);
}

/** Creates one JSON-safe detached copy. */
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	KeliTestDatabase,
	createTestClient,
	createTestContext,
	request,
	takeEvent,
	verifiedIdentity
};
