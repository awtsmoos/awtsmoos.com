// B"H
// Boruch Hashem
// Blessed is He

const { SnapshotEnvelopeLedger } = require("./snapshotEnvelope.js");
const {
	readMissionRoomSnapshot
} = require("./missionSnapshotService.js");

/**
 * @file Owns one authorized EventSource mission-room lifecycle.
 * @description
 * The Awtsmoos renews pulse and payload each instant. Awtsmoos.com receives one
 * canonical relay closure from the authorization boundary, then keeps the fallback
 * ordered, non-overlapping, bounded, and unable to switch tunnels mid-session.
 */

function startMissionRoomStream(context, options, sendAuthorized) {
	const response = context.response || context.res;
	const request = context.request || context.req;
	const ledger = new SnapshotEnvelopeLedger(options);
	let closed = false;
	let busy = false;
	prepareResponse(response, options.missionId);
	return new Promise((resolve) => {
		const sendSnapshot = async (force) => {
			if (closed || busy) {
				return;
			}
			busy = true;
			try {
				const snapshot = await readMissionRoomSnapshot(
					sendAuthorized,
					options
				);
				const frame = ledger.next({
					...snapshot,
					serverPush: "eventsource"
				}, force);
				if (frame) {
					writeEvent(
						response,
						snapshot.ok ? "snapshot" : "error",
						frame
					);
				}
			} finally {
				busy = false;
			}
		};
		const heartbeat = () => {
			if (!closed) {
				response.write(`: heartbeat ${Date.now()}\n\n`);
			}
		};
		const pollingTimer = setInterval(
			() => sendSnapshot(false),
			options.pollMs
		);
		const heartbeatTimer = setInterval(heartbeat, 15000);
		const close = () => {
			if (closed) {
				return;
			}
			closed = true;
			clearInterval(pollingTimer);
			clearInterval(heartbeatTimer);
			resolve("");
		};
		pollingTimer.unref?.();
		heartbeatTimer.unref?.();
		request?.on?.("close", close);
		response.on?.("close", close);
		sendSnapshot(true);
	});
}

function prepareResponse(response, missionId) {
	response.statusCode = 200;
	response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
	response.setHeader("Cache-Control", "no-cache, no-store, max-age=0");
	response.setHeader("Connection", "keep-alive");
	response.write(`: awtsmoos mission room ${missionId}\n\n`);
}

function writeEvent(response, eventName, frame) {
	response.write(
		`event: ${eventName}\ndata: ${JSON.stringify(frame)}\n\n`
	);
}

module.exports = {
	startMissionRoomStream,
	writeEvent
};
