// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	NetzachPublicMessageRepository
} = require("./publicMessageRepository.js");
const {
	activePublicIndexLocks
} = require("./publicIndexLock.js");

/**
 * @file Proves two same-process public Torah publishes cannot erase one another from bounded pointer indexes.
 * @description The Awtsmoos renews two teachings at once while Awtsmoos.com delays finite index writes on purpose;
 * the lock must let both canonical lights remain discoverable in channel, site, and verified-account history after the race.
 */

class SlowIndexDatabase {
	constructor() {
		this.values = new Map();
	}

	async get(path) {
		return clone(this.values.get(path) ?? null);
	}

	async write(path, value) {
		if (path.includes("/indexes/") || path.includes("/users/")) {
			await delay(12);
		}
		this.values.set(path, clone(value));
		return true;
	}
}

async function runPublicIndexConcurrencyContract() {
	const database = new SlowIndexDatabase();
	const repository = new NetzachPublicMessageRepository(database);
	const channel = {
		kind: "game",
		id: "game:concurrent-torah",
		label: "Concurrent Torah"
	};
	const member = {
		authenticated: true,
		accountId: "account-concurrent"
	};
	const messages = [
		message("concurrent-a", channel),
		message("concurrent-b", channel)
	];
	await Promise.all(
		messages.map((entry) => repository.save(entry, member))
	);
	assertIds(await repository.history(channel), messages);
	assertIds(await repository.siteHistory(), messages);
	assertIds(await repository.userHistory(member.accountId), messages);
	assert.equal(activePublicIndexLocks(), 0);
}

function message(id, channel) {
	return {
		id,
		channel,
		createdAt: Date.now(),
		sources: []
	};
}

function assertIds(actual, expected) {
	assert.deepEqual(
		new Set(actual.map((entry) => entry.id)),
		new Set(expected.map((entry) => entry.id))
	);
}

function delay(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

runPublicIndexConcurrencyContract().then(() => {
	console.log("Universal public index concurrency contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
