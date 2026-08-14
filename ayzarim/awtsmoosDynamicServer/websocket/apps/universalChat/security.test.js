// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { createUniversalChatApplication } = require("./application.js");
const {
	KeliUniversalChatTestDatabase,
	createTestClient,
	createTestContext,
	request,
	verifiedIdentity
} = require("./testSupport.js");

/**
 * @file Proves universal chat cannot publish arbitrary prose, fabricated sources, stolen sessions, aliases, or channels.
 * @description The Awtsmoos renews discussion through Torah while every counterfeit doorway closes under Gevurah's light;
 * Awtsmoos.com tests the attacker's path before a browser ever receives the right to publish in sight.
 */

const CHESS = { kind: "game", id: "game:chess", label: "Chess" };
const POST = { kind: "post", id: "post:/heichelos/ikar/post/test", label: "Post: Test" };

/** Returns one trusted server result set used only by this isolated contract. */
async function fakeSearch() {
	return [
		{ id: "source-a", type: "library", title: "Likkutei Sichos", reference: "Vol. 1", excerpt: "Torah passage A", href: "/heichelos/ikar/post/a", meta: {} },
		{ id: "source-b", type: "tanach", title: "Bereishis 1:1", reference: "Bereishis/1/1", excerpt: "בראשית ברא", href: "/heichelos/tanach/series/root/0?idx=0", meta: {} }
	];
}

/** Runs the source-only and identity/channel tamper contract. */
async function runSecurityContract() {
	const database = new KeliUniversalChatTestDatabase();
	await database.write("/users/account-a/aliases/RebbeLearner", { id: "RebbeLearner" });
	const app = createUniversalChatApplication({ searchGateway: fakeSearch });
	const owner = createTestClient("owner");
	const stranger = createTestClient("stranger");
	const ownerContext = createTestContext(owner, database, verifiedIdentity("account-a"));
	const strangerContext = createTestContext(stranger, database, null);

	const entered = await app.handleVersioned(ownerContext, request("universalChat.enter", { channel: CHESS, alias: "RebbeLearner" }));
	assert.equal(entered.payload.member.alias, "RebbeLearner");
	const anonymous = await app.handleVersioned(strangerContext, request("universalChat.enter", { channel: POST, alias: "RebbeLearner" }));
	assert.equal(anonymous.payload.member.alias, "Ploni");

	const search = await app.handleVersioned(ownerContext, request("universalChat.search", { prompt: "What does Torah say about creation?" }));
	assert.equal(search.payload.sources.length, 2);
	const sessionId = search.payload.searchSessionId;

	const published = await app.handleVersioned(ownerContext, request("universalChat.publish", {
		channel: CHESS,
		searchSessionId: sessionId,
		sourceIds: ["source-a"]
	}));
	assert.equal(published.payload.message.sources[0].excerpt, "Torah passage A");
	assert.equal("prompt" in published.payload.message, false);
	assert.equal("messageText" in published.payload.message, false);

	await assert.rejects(
		() => app.handleVersioned(ownerContext, request("universalChat.publish", { channel: CHESS, searchSessionId: sessionId, sourceIds: ["forged"] })),
		(error) => error.code === "UNIVERSAL_CHAT_SOURCE_FORGED"
	);
	await assert.rejects(
		() => app.handleVersioned(strangerContext, request("universalChat.publish", { channel: POST, searchSessionId: sessionId, sourceIds: ["source-a"] })),
		(error) => error.code === "UNIVERSAL_CHAT_SEARCH_SESSION"
	);

	const strangerSearch = await app.handleVersioned(strangerContext, request("universalChat.search", { prompt: "creation" }));
	await assert.rejects(
		() => app.handleVersioned(strangerContext, request("universalChat.publish", { channel: CHESS, searchSessionId: strangerSearch.payload.searchSessionId, sourceIds: ["source-a"] })),
		(error) => error.code === "UNIVERSAL_CHAT_CHANNEL_FORGED"
	);
}

runSecurityContract().then(() => {
	console.log("Universal Torah chat security contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
