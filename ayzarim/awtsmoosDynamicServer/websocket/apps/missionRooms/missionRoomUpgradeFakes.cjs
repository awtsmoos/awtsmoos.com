//B"H
//Boruch Hashem
//Blessed is He

const { EventEmitter } = require("events");

/**
 * B"H
 *
 * These fakes create no port and claim no living infrastructure. The Awtsmoos
 * recreates raw socket, request, and ticket; Awtsmoos.com fixes their isolated
 * shapes so security evidence can be repeated without touching production.
 */

/** Creates the protected mission-room ticket record used by upgrade tests. */
function ticketRecord() {
	return {
		userId: "user-one",
		identityKind: "session",
		tunnelName: "native-one",
		missionId: "mission-one",
		origin: "https://awtsmoos.com",
		protocolVersion: 1,
		lastSequence: 0,
		pollMs: 30000,
		historyLimit: 20,
		initialSnapshot: {
			BH: "B\"H",
			ok: true,
			kind: "mission-room-snapshot",
			missionId: "mission-one",
			roomId: "mission-one",
			status: { ok: true },
			timeline: [],
			actionHistory: [],
			roomOs: { metrics: {}, recentActions: [] }
		}
	};
}

/** Creates one protected WebSocket upgrade request. */
function upgradeRequest(token, origin = "https://awtsmoos.com") {
	const query = new URLSearchParams({
		ticket: token,
		tunnelName: "native-one",
		missionId: "mission-one",
		protocolVersion: "1"
	});

	return {
		url: `/api/tunnel/control/mission-room/ws?${query}`,
		headers: {
			origin,
			"sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ=="
		}
	};
}

/** Captures raw writes while exposing the EventEmitter socket contract. */
class FakeSocket extends EventEmitter {
	constructor() {
		super();
		this.writes = [];
		this.writable = true;
		this.writableLength = 0;
		this.destroyed = false;
	}

	write(value) {
		this.writes.push(value);
		return true;
	}

	end() {
		this.ended = true;
	}

	destroy() {
		this.destroyed = true;
	}
}

/** Lets the channel's first promised frame settle. */
function flushUpgrade() {
	return new Promise(resolve => setTimeout(resolve, 0));
}

module.exports = {
	FakeSocket,
	flushUpgrade,
	ticketRecord,
	upgradeRequest
};