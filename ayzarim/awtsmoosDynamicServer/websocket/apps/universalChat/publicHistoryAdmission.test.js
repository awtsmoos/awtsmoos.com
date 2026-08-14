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
 * @file Proves modern browser admission may request a smaller recent Torah window without changing legacy entry snapshots.
 * @description The Awtsmoos renews every teaching beyond the first screen; Awtsmoos.com sends a light initial page to modern browsers,
 * returns honest cursor metadata for older indexed sources, and keeps the old full bounded river for callers that never asked to page in sight.
 */

const CHANNEL = {
	kind: "app",
	id: "app:history-admission",
	label: "History Admission"
};

async function runPublicHistoryAdmissionContract() {
	const database = new KeliUniversalChatTestDatabase();
	const repository = new NetzachPublicMessageRepository(database);
	for (let index = 1; index <= 5; index++) {
		await repository.save(message(index), { authenticated: false });
	}
	const modern = await enter(database, "modern", { historyLimit: 2 });
	assert.deepEqual(ids(modern.payload.channelHistory), ["m4", "m5"]);
	assert.equal(modern.payload.channelHistoryPage.hasMore, true);
	assert.equal(modern.payload.channelHistoryPage.nextBefore, "m4");
	assert.deepEqual(ids(modern.payload.siteHistory), ["m4", "m5"]);
	assert.equal(modern.payload.siteHistoryPage.limit, 2);
	const legacy = await enter(database, "legacy", {});
	assert.deepEqual(ids(legacy.payload.channelHistory), ["m1", "m2", "m3", "m4", "m5"]);
	assert.equal("channelHistoryPage" in legacy.payload, false);
}

async function enter(database, name, extra) {
	const app = createUniversalChatApplication();
	const client = createTestClient(name);
	return app.handleVersioned(
		createTestContext(client, database, null),
		request("universalChat.enter", {
			channel: CHANNEL,
			...extra
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

function ids(messages) {
	return messages.map((entry) => entry.id);
}

runPublicHistoryAdmissionContract().then(() => {
	console.log("Universal public history admission contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
