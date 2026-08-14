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
	takeEvent,
	verifiedIdentity
} = require("./testSupport.js");

/**
 * @file Proves room roles, spectators, chat, signaling, public discovery, and result flow in-process.
 * @description The Awtsmoos renews White, Black, and watcher around one tested board of light;
 * Awtsmoos.com proves each role's boundary before the living WebSocket carries it into sight.
 */

/** Runs the social room contract and throws immediately on any authorization regression. */
async function runSocialRoomContract() {
	const database = new KeliTestDatabase();
	const app = createChessApplication();
	const host = createTestClient("host");
	const guest = createTestClient("guest");
	const watcher = createTestClient("watcher");
	const hostContext = createTestContext(host, database, verifiedIdentity("host-account"));
	const guestContext = createTestContext(guest, database, verifiedIdentity("guest-account"));
	const watchContext = createTestContext(watcher, database, verifiedIdentity("watch-account"));

	const created = await app.handleVersioned(hostContext, request("chess.room.create", {
		mode: "online-pvp",
		visibility: "public",
		title: "Public Test"
	}));
	assert.equal(created.payload.role, "player-white");
	assert.equal(created.payload.visibility, "public");

	const joined = await app.handleVersioned(guestContext, request("chess.room.join", {
		roomId: created.payload.roomId
	}));
	assert.equal(joined.payload.role, "player-black");
	assert.ok(takeEvent(host, "chess.room.ready"));

	const watched = await app.handleVersioned(watchContext, request("chess.room.watch", {
		roomId: created.payload.roomId,
		displayName: "Watcher"
	}));
	assert.equal(watched.payload.role, "spectator");
	assert.equal(watched.payload.playerToken, "");

	await assert.rejects(
		() => app.handleVersioned(watchContext, request("chess.click.submit", {
			roomId: created.payload.roomId,
			row: 6,
			column: 4
		})),
		(error) => error.code === "CHESS_PLAYER_ROLE_REQUIRED"
	);

	const moved = await app.handleVersioned(hostContext, request("chess.click.submit", {
		roomId: created.payload.roomId,
		row: 6,
		column: 4
	}));
	assert.equal(moved.payload.sequence, 1);
	assert.ok(takeEvent(watcher, "chess.game.event"));
	assert.ok(takeEvent(guest, "chess.click"));

	const chat = await app.handleVersioned(watchContext, request("chess.chat.send", {
		roomId: created.payload.roomId,
		message: "B\"H hello"
	}));
	assert.equal(chat.payload.message, "B\"H hello");
	assert.ok(takeEvent(host, "chess.chat.message"));

	await app.handleVersioned(watchContext, request("chess.media.signal", {
		roomId: created.payload.roomId,
		targetPeerId: created.payload.peerId,
		signal: {
			kind: "offer",
			sdp: { type: "offer", sdp: "v=0" }
		}
	}));
	assert.ok(takeEvent(host, "chess.media.signal"));

	const listed = await app.handleVersioned(watchContext, request("chess.room.list"));
	assert.equal(listed.payload.rooms.length, 1);
	assert.equal(listed.payload.rooms[0].roomId, created.payload.roomId);

	const finished = await app.handleVersioned(hostContext, request("chess.game.finish", {
		roomId: created.payload.roomId,
		result: "White wins"
	}));
	assert.equal(finished.payload.result, "White wins");
}

runSocialRoomContract().then(() => {
	console.log("Chess social room contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
