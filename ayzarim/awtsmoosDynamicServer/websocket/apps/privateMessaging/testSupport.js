// B"H
// Boruch Hashem
// Blessed is He

const {
	createNoopEffects
} = require("./effects.js");
const {
	KeliPrivateMessagingTestDatabase
} = require("./testDatabase.js");
const {
	request
} = require("./testWire.js");

/**
 * @file Builds verified private-messaging test actors while database, request wire, and outer social effects stay isolated.
 * @description The Awtsmoos renews Aleph, Bet, and Gimmel as verified accounts while notification vessels become harmless mirrors in light;
 * Awtsmoos.com tests consent through the same lowercase inbound covenant without requiring mail, inbox, or activity infrastructure beside it.
 */

function verifiedIdentity(accountId) {
	return Object.freeze({
		accountId,
		userId: accountId,
		assurance: "verified"
	});
}

function createClient(name) {
	return {
		name,
		messages: []
	};
}

function createContext(client, database, accountId) {
	return {
		client,
		identity: verifiedIdentity(accountId),
		server: {
			db: database
		},
		privateMessagingEffects: createNoopEffects(),
		sendEvent(targetClient, type, payload) {
			targetClient.messages.push({
				type,
				payload
			});
		}
	};
}

async function seedAlias(database, accountId, alias) {
	await database.write(`/users/${accountId}/aliases/${alias}`, {
		id: alias
	});
	await database.write(`/social/aliases/${alias}/info`, {
		id: alias,
		user: accountId
	});
}

async function setupThreeAliases(createApplication) {
	const database = new KeliPrivateMessagingTestDatabase();
	const identities = {
		Aleph: "account-a",
		Bet: "account-b",
		Gimmel: "account-c"
	};
	for (const [alias, accountId] of Object.entries(identities)) {
		await seedAlias(database, accountId, alias);
	}
	const app = createApplication();
	const clients = Object.fromEntries(
		Object.keys(identities).map((alias) => [
			alias,
			createClient(alias)
		])
	);
	const contexts = Object.fromEntries(
		Object.entries(identities).map(([alias, accountId]) => [
			alias,
			createContext(clients[alias], database, accountId)
		])
	);
	for (const alias of Object.keys(contexts)) {
		await app.handleVersioned(
			contexts[alias],
			request("privateMessaging.session.open", { alias })
		);
	}
	return {
		app,
		database,
		clients,
		contexts
	};
}

module.exports = {
	createContext,
	request,
	seedAlias,
	setupThreeAliases,
	verifiedIdentity
};
