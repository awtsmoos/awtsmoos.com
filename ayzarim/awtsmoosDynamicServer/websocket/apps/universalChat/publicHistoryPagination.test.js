// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createUniversalChatApplication
} = require("./application.js");
const {
	NetzachPublicMessageRepository
} = require("./publicMessageRepository.js");
const {
	KeliUniversalChatTestDatabase,
	createTestClient,
	createTestContext,
	request
} = require("./testSupport.js");

/**
 * @file Proves backward cursor pages over the bounded public Torah index without changing legacy flat-history responses.
 * @description The Awtsmoos renews five teachings beyond every page; Awtsmoos.com returns newest finite windows in chronological order,
 * walks backward without overlap, preserves old callers, and marks a cursor that aged from the recent index instead of inventing memory in sight.
 */

const CHANNEL = {
	kind: "game",
	id: "game:paged-torah",
	label: "Paged Torah"
};

async function runPublicHistoryPaginationContract() {
	const database = new KeliUniversalChatTestDatabase();
	const repository = new NetzachPublicMessageRepository(database);
	for (let index = 1; index <= 5; index++) {
		await repository.save(message(index), { authenticated: false });
	}
	const app = createUniversalChatApplication();
	const client = createTestClient("history-reader");
	const context = createTestContext(client, database, null);
	await app.handleVersioned(
		context,
		request("universalChat.enter", { channel: CHANNEL })
	);
	const legacy = await history(app, context, {});
	assert.deepEqual(ids(legacy), ["m1", "m2", "m3", "m4", "m5"]);
	assert.equal("page" in legacy.payload, false);
	const first = await history(app, context, { limit: 2 });
	assert.deepEqual(ids(first), ["m4", "m5"]);
	assert.equal(first.payload.page.hasMore, true);
	assert.equal(first.payload.page.nextBefore, "m4");
	const second = await history(app, context, {
		limit: 2,
		before: first.payload.page.nextBefore
	});
	assert.deepEqual(ids(second), ["m2", "m3"]);
	const third = await history(app, context, {
		limit: 2,
		before: second.payload.page.nextBefore
	});
	assert.deepEqual(ids(third), ["m1"]);
	assert.equal(third.payload.page.hasMore, false);
	const expired = await history(app, context, {
		limit: 2,
		before: "aged-out-message"
	});
	assert.deepEqual(ids(expired), []);
	assert.equal(expired.payload.page.expired, true);
}

function history(app, context, options) {
	return app.handleVersioned(
		context,
		request("universalChat.history", {
			scope: "channel",
			channel: CHANNEL,
			...options
		})
	);
}

function message(index) {
	return {
		id: `m${index}`,
		channel: CHANNEL,
		createdAt: index,
		sources: []
	};
}

function ids(response) {
	return response.payload.messages.map((entry) => entry.id);
}

runPublicHistoryPaginationContract().then(() => {
	console.log("Universal public history pagination contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
