//B"H
//Boruch Hashem
//Blessed is He

const { EventEmitter } = require("events");
const {
	provenBinding
} = require(
	"../../../../../geelooy/api/tunnel/control/core/test/provenanceFixture.cjs"
);

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
		accountId: "account-one",
		userId: "user-one",
		sessionId: "session-one",
		identityKind: "session",
		ownerAccountId: "account-one",
		tunnelId: "tun_one",
		tunnelName: "native-one",
		missionId: "mission-one",
		roomId: "mission-one",
		origin: "https://awtsmoos.com",
		protocolVersion: 1,
		permissionVersion: 4,
		revocationVersion: 2,
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

/** Creates the current authenticated account bound to the protected ticket. */
function identityRecord() {
	return {
		accountId: "account-one",
		userId: "user-one",
		sessionId: "session-one"
	};
}

/** Creates current possession-backed authorization for the protected tunnel. */
function authorizationStore() {
	return {
		tunnelBindings: {
			tun_one: provenBinding({
				tunnelId: "tun_one",
				tunnelName: "native-one",
				deviceId: "device-one",
				ownerAccountId: "account-one",
				permissionVersion: 4,
				revocationVersion: 2
			})
		},
		tunnelGrants: {},
		tunnelPairings: {},
		tunnelAudit: []
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
	authorizationStore,
	FakeSocket,
	flushUpgrade,
	identityRecord,
	ticketRecord,
	upgradeRequest
};
