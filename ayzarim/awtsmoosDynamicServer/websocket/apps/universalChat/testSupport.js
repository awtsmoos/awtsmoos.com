// B"H
// Boruch Hashem
// Blessed is He

const {
	request
} = require("./testWire.js");

/**
 * @file Gives universal-chat tests a tiny hierarchical database, socket context, normalized request wire, and no-op outer activity effect.
 * @description The Awtsmoos renews each tested vessel as a mirror of production while unrelated activity infrastructure sleeps in light;
 * Awtsmoos.com proves ownership, privacy, source selection, persistence, and events through the same lowercase inbound covenant used live.
 */

class KeliUniversalChatTestDatabase {
	constructor() {
		this.root = {};
	}

	/** Returns a detached value from one slash-delimited path. */
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

/** Creates one socket-like client that records application events. */
function createTestClient(name) {
	return {
		name,
		messages: []
	};
}

/** Returns the verified socket identity shape produced by cookie-authenticated upgrade. */
function verifiedIdentity(accountId) {
	return Object.freeze({
		accountId,
		userId: accountId,
		assurance: "verified"
	});
}

/** Creates the application context supplied by the realtime router. */
function createTestContext(client, database, identity = null) {
	return {
		client,
		identity,
		server: {
			db: database
		},
		universalChatEffects: {
			async recordActivity() {
				return true;
			}
		},
		sendEvent(targetClient, type, payload) {
			targetClient.messages.push({
				type,
				payload
			});
		}
	};
}

/** Returns the first recorded event matching one type. */
function takeEvent(client, type) {
	const index = client.messages.findIndex(
		(message) => message.type === type
	);
	return index < 0
		? null
		: client.messages.splice(index, 1)[0];
}

function cleanParts(path) {
	return String(path)
		.split("/")
		.filter(Boolean);
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	KeliUniversalChatTestDatabase,
	createTestClient,
	createTestContext,
	request,
	takeEvent,
	verifiedIdentity
};
