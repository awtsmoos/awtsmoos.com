// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { createUniversalChatApplication } = require("./application.js");
const {
	KeliUniversalChatTestDatabase,
	createTestClient,
	createTestContext,
	request
} = require("./testSupport.js");

/**
 * @file Proves source-backed public Torah discussion survives application restart without persisting private search intent.
 * @description The Awtsmoos renews a new application process around the same durable teaching while ephemeral search sessions disappear in light;
 * Awtsmoos.com remembers the selected source post across restart yet never stores the private prompt inside the public message sight.
 */

const CHESS = {
	kind: "game",
	id: "game:chess",
	label: "Chess"
};

async function fakeSearch() {
	return [{
		id: "durable-source",
		type: "library",
		title: "Likkutei Sichos",
		reference: "Test reference",
		excerpt: "A durable Torah passage",
		href: "/heichelos/ikar/post/test",
		meta: {}
	}];
}

async function runPersistenceContract() {
	const database = new KeliUniversalChatTestDatabase();
	const firstApp = createUniversalChatApplication({
		searchGateway: fakeSearch
	});
	const firstClient = createTestClient("first");
	const firstContext = createTestContext(firstClient, database, null);
	await firstApp.handleVersioned(
		firstContext,
		request("universalChat.enter", { channel: CHESS })
	);
	const search = await firstApp.handleVersioned(
		firstContext,
		request("universalChat.search", {
			prompt: "private search intent that must not become a post"
		})
	);
	const published = await firstApp.handleVersioned(
		firstContext,
		request("universalChat.publish", {
			channel: CHESS,
			searchSessionId: search.payload.searchSessionId,
			sourceIds: ["durable-source"]
		})
	);
	assert.equal(
		"prompt" in published.payload.message,
		false
	);

	const secondApp = createUniversalChatApplication({
		searchGateway: fakeSearch
	});
	const secondClient = createTestClient("second");
	const secondContext = createTestContext(secondClient, database, null);
	const restartedEntry = await secondApp.handleVersioned(
		secondContext,
		request("universalChat.enter", { channel: CHESS })
	);
	assert.equal(restartedEntry.payload.channelHistory.length, 1);
	assert.equal(
		restartedEntry.payload.channelHistory[0].id,
		published.payload.message.id
	);
	assert.equal(restartedEntry.payload.siteHistory.length, 1);
	assert.equal(
		restartedEntry.payload.siteHistory[0].sources[0].excerpt,
		"A durable Torah passage"
	);
}

runPersistenceContract().then(() => {
	console.log("Universal Torah chat persistence contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
