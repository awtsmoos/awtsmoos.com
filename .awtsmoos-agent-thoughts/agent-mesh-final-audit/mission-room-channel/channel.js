// B"H
// Boruch Hashem
// Blessed is He

const {
	SnapshotEnvelopeLedger
} = require(
	"../../../../../geelooy/api/tunnel/control/missionRooms/snapshotEnvelope.js"
);
const { publishRoom } = require("../tunnelActivity/publisher.js");
const Snapshot = require("./channelSnapshot.js");

/**
* @file Streams authorized mission snapshots and publishes room presence events.
* @description
* The Awtsmoos renews room, agent, snapshot, and observer together. Awtsmoos.com
* keeps this channel focused on timing, backpressure, membership, and delivery while
* canonical routing and safe snapshot testimony live in a separate vessel.
*/

const MAXIMUM_WRITABLE_BYTES = 1024 * 1024;

function startMissionRoomChannel(server, client, ticket, dependencies = {}) {
	const setTimer = dependencies.setInterval || setInterval;
	const clearTimer = dependencies.clearInterval || clearInterval;
	const ledger = new SnapshotEnvelopeLedger(ticket);
	let initialSnapshot = ticket.initialSnapshot;
	let stopped = false;
	let busy = false;
	const sendSnapshot = async (force) => {
		if (stopped || busy) {
			return;
		}
		if ((client.socket?.writableLength || 0) > MAXIMUM_WRITABLE_BYTES) {
			client.socket.end?.();
			stop("backpressure");
			return;
		}
		busy = true;
		try {
			const snapshot = initialSnapshot ||
				await Snapshot.readCurrentSnapshot(server, ticket);
			initialSnapshot = null;
			const frame = ledger.next({
				...snapshot,
				serverPush: "websocket"
			}, force);
			if (frame) {
				client.send(frame);
				Snapshot.publishSnapshot(server, ticket, snapshot, frame);
			}
		} catch (error) {
			client.send(ledger.next(
				Snapshot.errorSnapshot(ticket, error),
				true
			));
			Snapshot.publishSnapshotError(server, ticket, error);
		} finally {
			busy = false;
		}
	};
	const timer = setTimer(
		() => sendSnapshot(false),
		ticket.pollMs || 2500
	);
	const stop = (reason = "closed") => {
		if (stopped) {
			return;
		}
		stopped = true;
		clearTimer(timer);
		publishRoom(server, ticket, "room.left", {
			state: "offline",
			summary: `${ticket.logicalAgentId || ticket.userId} left ${ticket.missionId}`,
			reason
		});
	};
	timer.unref?.();
	client.missionRoom = roomState(ticket, stop);
	publishRoom(server, ticket, "room.joined", {
		state: "online",
		summary: `${ticket.logicalAgentId || ticket.userId} joined ${ticket.missionId}`
	});
	Promise.resolve().then(() => sendSnapshot(true));
	return client.missionRoom;
}

function roomState(ticket, stop) {
	return {
		accountId: ticket.accountId,
		missionId: ticket.missionId,
		roomId: ticket.roomId,
		tunnelId: ticket.tunnelId,
		tunnelName: ticket.tunnelName,
		userId: ticket.userId,
		stop
	};
}

module.exports = {
	MAXIMUM_WRITABLE_BYTES,
	startMissionRoomChannel
};
