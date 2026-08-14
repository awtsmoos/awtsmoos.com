// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	closeRealtimeClients,
	createRealtimeTestClient,
	sendRealtimeRequest,
	waitForRealtimeMessage
} = require("./realtimeTestClient.js");

/**
 * @file Proves players, spectator, chat, media signaling, and public discovery through the live realtime router.
 * @description The Awtsmoos renews three actual sockets around one room of light;
 * Awtsmoos.com proves the network path itself, so unit certainty becomes living sight.
 */

/** Runs the anonymous live-router contract; cookie-authenticated history is tested separately in-process. */
async function runRealtimeIntegration() {
	const host = await createRealtimeTestClient("host");
	const guest = await createRealtimeTestClient("guest");
	const watcher = await createRealtimeTestClient("watcher");
	try {
		const created = await sendRealtimeRequest(host, "chess.room.create", {
			mode: "online-pvp",
			visibility: "public",
			title: "Realtime Test"
		});
		assert.equal(created.type, "chess.room.created");

		const joined = await sendRealtimeRequest(guest, "chess.room.join", {
			roomId: created.payload.roomId
		});
		assert.equal(joined.payload.role, "player-black");
		await waitForRealtimeMessage(host, (message) => message.type === "chess.room.ready");

		const watched = await sendRealtimeRequest(watcher, "chess.room.watch", {
			roomId: created.payload.roomId,
			displayName: "Watcher"
		});
		assert.equal(watched.payload.role, "spectator");
		assert.equal(watched.payload.playerToken, "");

		const forbidden = await sendRealtimeRequest(watcher, "chess.click.submit", {
			roomId: created.payload.roomId,
			row: 6,
			column: 4
		});
		assert.equal(forbidden.type, "error");

		const accepted = await sendRealtimeRequest(host, "chess.click.submit", {
			roomId: created.payload.roomId,
			row: 6,
			column: 4
		});
		assert.equal(accepted.payload.sequence, 1);
		const gameEvent = await waitForRealtimeMessage(
			watcher,
			(message) => message.type === "chess.game.event"
		);
		assert.equal(gameEvent.payload.event.kind, "click");

		const chatted = await sendRealtimeRequest(watcher, "chess.chat.send", {
			roomId: created.payload.roomId,
			message: "Watching live"
		});
		assert.equal(chatted.type, "chess.chat.sent");
		await waitForRealtimeMessage(host, (message) => message.type === "chess.chat.message");

		const signaled = await sendRealtimeRequest(watcher, "chess.media.signal", {
			roomId: created.payload.roomId,
			targetPeerId: created.payload.peerId,
			signal: {
				kind: "offer",
				sdp: { type: "offer", sdp: "v=0" }
			}
		});
		assert.equal(signaled.type, "chess.media.signal.accepted");
		const mediaEvent = await waitForRealtimeMessage(
			host,
			(message) => message.type === "chess.media.signal"
		);
		assert.equal(mediaEvent.payload.fromPeerId, watched.payload.peerId);

		const listed = await sendRealtimeRequest(watcher, "chess.room.list");
		assert.ok(listed.payload.rooms.some((room) => room.roomId === created.payload.roomId));
	} finally {
		closeRealtimeClients(host, guest, watcher);
	}
}

runRealtimeIntegration().then(() => {
	console.log("Chess realtime social integration: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
