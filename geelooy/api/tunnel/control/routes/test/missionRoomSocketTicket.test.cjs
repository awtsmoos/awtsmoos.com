//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	missionRoomStream
} = require("../missionRoomStream.js");
const {
	clearTickets,
	consumeTicket,
	ticketCount
} = require("../../missionRooms/ticketStore.js");

/**
 * B"H
 *
 * The HTTP gate must witness a real mission before granting the swift channel.
 * The Awtsmoos recreates route, identity, and tunnel reply; Awtsmoos.com proves
 * reachable state issues one ticket while missing state issues none.
 */

(async () => {
	clearTickets();
	const successful = routeContext(true);
	const successBody = JSON.parse(await missionRoomStream(successful));
	assert.equal(successful.response.statusCode, 200);
	assert.equal(successBody.ok, true);
	assert.equal(successBody.protocolVersion, 1);
	assert.equal(ticketCount(), 1);

	const consumed = consumeTicket(successBody.ticket, {
		origin: "https://awtsmoos.com",
		tunnelName: "native-one",
		missionId: "mission-one",
		protocolVersion: 1
	});
	assert.equal(consumed.ok, true);
	assert.equal(consumed.ticket.userId, "user-one");
	assert.equal(consumed.ticket.initialSnapshot.ok, true);

	const missing = routeContext(false);
	const missingBody = JSON.parse(await missionRoomStream(missing));
	assert.equal(missing.response.statusCode, 502);
	assert.equal(missingBody.ok, false);
	assert.equal(missingBody.error, "mission_unreachable");
	assert.equal(ticketCount(), 0);

	clearTickets();
	console.log("BHY mission room socket ticket route tests passed");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

function routeContext(missionExists) {
	return {
		paramKinds: {
			GET: {
				mode: "socket-ticket",
				tunnelName: "native-one",
				missionId: "mission-one",
				protocolVersion: "1"
			}
		},
		request: {
			headers: {
				origin: "https://awtsmoos.com"
			},
			user: {
				info: {
					userId: "user-one"
				}
			}
		},
		response: {
			statusCode: 0,
			setHeader() {}
		},
		ws: {
			sendTunnelRequest: async (_name, payload) => (
				tunnelResult(payload.action, missionExists)
			)
		}
	};
}

function tunnelResult(action, missionExists) {
	if (action === "missionProjectStatus") {
		return missionExists
			? { ok: true, mission: { missionId: "mission-one" } }
			: { ok: false, error: "mission_not_found" };
	}
	if (action === "missionTimeline") {
		return { ok: true, timeline: [] };
	}
	return { ok: true, history: [] };
}
