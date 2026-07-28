//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	readMissionRoomSnapshot
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/missionSnapshotService.js");
const {
	startMissionRoomChannel
} = require("./channel.js");

/**
 * B"H
 *
 * The channel should speak once for truth, remain silent for sameness, and speak
 * again for change. The Awtsmoos renews every state; Awtsmoos.com proves that
 * sequence, suppression, and cleanup remain measurable in an isolated vessel.
 */

(async () => {
	let phase = "active";
	let intervalCallback;
	let cleared = false;
	const sent = [];
	const ticket = {
		tunnelName: "native-one",
		missionId: "mission-one",
		lastSequence: 4,
		pollMs: 900,
		historyLimit: 20
	};
	const server = {
		sendTunnelRequest: async (...args) => {
			const payload = args.findLast(value => value?.action);
			return tunnelResult(payload.action, phase);
		}
	};

	ticket.initialSnapshot = await readMissionRoomSnapshot(
		payload => server.sendTunnelRequest("", payload),
		ticket
	);
	const client = {
		socket: {
			writableLength: 0,
			end() {
				throw new Error("healthy client must not be ended");
			}
		},
		send(frame) {
			sent.push(frame);
		}
	};
	const timer = {
		unref() {}
	};
	const session = startMissionRoomChannel(server, client, ticket, {
		setInterval(callback) {
			intervalCallback = callback;
			return timer;
		},
		clearInterval(value) {
			assert.equal(value, timer);
			cleared = true;
		}
	});

	await flush();
	assert.equal(sent.length, 1);
	assert.equal(sent[0].sequence, 5);
	assert.equal(sent[0].serverPush, "websocket");
	await intervalCallback();
	assert.equal(sent.length, 1);

	phase = "review";
	await intervalCallback();
	assert.equal(sent.length, 2);
	assert.equal(sent[1].sequence, 6);
	assert.equal(sent[1].status.mission.phase, "review");

	session.stop();
	assert.equal(cleared, true);
	console.log("BHY mission room channel tests passed");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

function tunnelResult(action, phase) {
	if (action === "missionProjectStatus") {
		return {
			ok: true,
			mission: {
				missionId: "mission-one",
				phase
			}
		};
	}
	if (action === "missionTimeline") {
		return { ok: true, timeline: [] };
	}
	return { ok: true, history: [] };
}

function flush() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
