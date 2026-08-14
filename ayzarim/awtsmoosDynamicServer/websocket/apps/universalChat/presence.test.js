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
 * @file Proves unique-person counts, all-tab privacy, and anonymous Ploni presence semantics.
 * @description The Awtsmoos renews one person through many tabs while Netzach counts the person beneath the windows;
 * Awtsmoos.com lets privacy veil every living tab of one account, while anonymous Ploni remains one ephemeral shore.
 */

const CHESS = { kind: "game", id: "game:chess", label: "Chess" };
const POST = { kind: "post", id: "post:/heichelos/ikar/post/test", label: "Post: Test" };

/** Returns one harmless source so construction never needs the real RAG stack in this presence-only test. */
async function fakeSearch() {
	return [{
		id: "source",
		type: "library",
		title: "Source",
		reference: "Ref",
		excerpt: "Text",
		href: "/source",
		meta: {}
	}];
}

/** Runs unique/public presence and persistent privacy behavior. */
async function runPresenceContract() {
	const database = new KeliUniversalChatTestDatabase();
	await database.write("/users/account-a/aliases/Aleph", { id: "Aleph" });
	const app = createUniversalChatApplication({ searchGateway: fakeSearch });
	const tabOne = createTestClient("tab-one");
	const tabTwo = createTestClient("tab-two");
	const guest = createTestClient("guest");
	const identity = verifiedIdentity("account-a");
	const one = createTestContext(tabOne, database, identity);
	const two = createTestContext(tabTwo, database, identity);
	const guestContext = createTestContext(guest, database, null);

	await app.handleVersioned(one, request("universalChat.enter", {
		channel: CHESS,
		alias: "Aleph"
	}));
	const second = await app.handleVersioned(two, request("universalChat.enter", {
		channel: CHESS,
		alias: "Aleph"
	}));
	assert.equal(second.payload.presence.totalOnline, 1);
	assert.equal(second.payload.presence.channelOnline, 1);

	const guestEntry = await app.handleVersioned(guestContext, request("universalChat.enter", {
		channel: POST
	}));
	assert.equal(guestEntry.payload.presence.totalOnline, 2);
	assert.equal(guestEntry.payload.member.alias, "Ploni");

	await app.handleVersioned(one, request("universalChat.presence.preference", {
		hidden: true
	}));
	const hiddenGuestView = await app.handleVersioned(guestContext, request("universalChat.enter", {
		channel: POST
	}));
	assert.equal(hiddenGuestView.payload.presence.totalOnline, 1);

	const tabThree = createTestClient("tab-three");
	const three = createTestContext(tabThree, database, identity);
	const hiddenReentry = await app.handleVersioned(three, request("universalChat.enter", {
		channel: CHESS,
		alias: "Aleph"
	}));
	assert.equal(hiddenReentry.payload.hidden, true);
	assert.equal(hiddenReentry.payload.presence.totalOnline, 1);

	await app.handleVersioned(three, request("universalChat.presence.preference", {
		hidden: false
	}));
	const visibleGuestView = await app.handleVersioned(guestContext, request("universalChat.enter", {
		channel: POST
	}));
	assert.equal(visibleGuestView.payload.presence.totalOnline, 2);
}

runPresenceContract().then(() => {
	console.log("Universal chat presence contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
