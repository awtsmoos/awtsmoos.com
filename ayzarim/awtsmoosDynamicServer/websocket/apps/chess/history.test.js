// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { createChessApplication } = require("./application.js");
const {
	KeliTestDatabase,
	createTestClient,
	createTestContext,
	request,
	verifiedIdentity
} = require("./testSupport.js");

/**
 * @file Proves verified-current-user chess history and private local-game recording without client account selection.
 * @description The Awtsmoos renews each remembered game beneath the identity proven at the gate in light;
 * Awtsmoos.com tests private history so no anonymous or foreign account may borrow another's right.
 */

/** Runs authenticated and anonymous private-history behavior against the real application handlers. */
async function runHistoryContract() {
	const database = new KeliTestDatabase();
	const app = createChessApplication();
	const user = createTestClient("user");
	const anonymous = createTestClient("anonymous");
	const userContext = createTestContext(
		user,
		database,
		verifiedIdentity("history-account")
	);
	const anonymousContext = createTestContext(anonymous, database, null);

	const started = await app.handleVersioned(userContext, request("chess.history.start", {
		mode: "pva",
		title: "Private Player vs AI"
	}));
	assert.equal(started.payload.authenticated, true);
	assert.match(started.payload.gameId, /^local-/);

	await app.handleVersioned(userContext, request("chess.history.activity", {
		gameId: started.payload.gameId,
		activity: {
			type: "game.click",
			row: 6,
			column: 4
		}
	}));
	await app.handleVersioned(userContext, request("chess.history.activity", {
		gameId: started.payload.gameId,
		activity: {
			type: "game.finished",
			result: "White wins"
		}
	}));

	const history = await app.handleVersioned(userContext, request("chess.history.list", {
		limit: 50
	}));
	assert.equal(history.payload.authenticated, true);
	assert.equal(history.payload.games.length, 1);
	assert.equal(history.payload.games[0].result, "White wins");
	assert.equal(history.payload.games[0].activity.length, 3);

	const anonymousStart = await app.handleVersioned(
		anonymousContext,
		request("chess.history.start", {
			mode: "local-pvp",
			title: "Anonymous local game"
		})
	);
	assert.deepEqual(anonymousStart.payload, {
		authenticated: false,
		gameId: ""
	});

	const anonymousHistory = await app.handleVersioned(
		anonymousContext,
		request("chess.history.list")
	);
	assert.deepEqual(anonymousHistory.payload, {
		authenticated: false,
		games: []
	});
}

runHistoryContract().then(() => {
	console.log("Chess personal history contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
