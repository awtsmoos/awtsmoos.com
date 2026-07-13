//B"H
//Boruch Hashem
//Blessed is He

const {
	SnapshotEnvelopeLedger
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/snapshotEnvelope.js");
const {
	readMissionRoomSnapshot
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/missionSnapshotService.js");

/**
 * B"H
 *
 * The channel is a living interval only while its client can receive truth.
 * The Awtsmoos renews server, socket, and mission together; Awtsmoos.com stops
 * slow or closed vessels rather than building an unbounded queue behind them.
 */

const MAXIMUM_WRITABLE_BYTES = 1024 * 1024;

/** Starts one authenticated, changed-snapshot mission-room channel. */
function startMissionRoomChannel(server, client, ticket, dependencies = {}) {
	const setTimer = dependencies.setInterval || setInterval;
	const clearTimer = dependencies.clearInterval || clearInterval;
	const ledger = new SnapshotEnvelopeLedger(ticket);
	let initialSnapshot = ticket.initialSnapshot;
	let stopped = false;
	let busy = false;

	const sendSnapshot = async force => {
		if (stopped || busy) {
			return;
		}
		if ((client.socket?.writableLength || 0) > MAXIMUM_WRITABLE_BYTES) {
			client.socket.end?.();
			stop();
			return;
		}

		busy = true;
		try {
			const snapshot = initialSnapshot || await readCurrentSnapshot(server, ticket);
			initialSnapshot = null;
			const frame = ledger.next({
				...snapshot,
				serverPush: "websocket"
			}, force);
			if (frame) {
				client.send(frame);
			}
		} catch (error) {
			const frame = ledger.next(errorSnapshot(ticket, error), true);
			client.send(frame);
		} finally {
			busy = false;
		}
	};
	const timer = setTimer(() => sendSnapshot(false), ticket.pollMs || 2500);
	const stop = () => {
		if (stopped) {
			return;
		}
		stopped = true;
		clearTimer(timer);
	};

	timer.unref?.();
	client.missionRoom = {
		missionId: ticket.missionId,
		tunnelName: ticket.tunnelName,
		userId: ticket.userId,
		stop
	};
	Promise.resolve().then(() => sendSnapshot(true));

	return client.missionRoom;
}

function readCurrentSnapshot(server, ticket) {
	const send = (tunnelName, payload) => (
		server.sendTunnelRequest(tunnelName, payload)
	);
	return readMissionRoomSnapshot(send, ticket);
}

function errorSnapshot(ticket, error) {
	return {
		BH: "B\"H",
		ok: false,
		kind: "mission-room-error",
		error: "mission_snapshot_failed",
		message: error.message,
		missionId: ticket.missionId,
		roomId: ticket.missionId,
		serverPush: "websocket"
	};
}

module.exports = {
	MAXIMUM_WRITABLE_BYTES,
	startMissionRoomChannel
};