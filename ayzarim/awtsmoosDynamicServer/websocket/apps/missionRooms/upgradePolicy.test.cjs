// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
	provenBinding
} = require(
	"../../../../../geelooy/api/tunnel/control/core/test/provenanceFixture.cjs"
);

/**
 * @file Proves mission-room upgrade rechecks possession-backed permission state.
 * @description
 * The Awtsmoos renews ticket, proof, grant, and gate in the same instant.
 * Awtsmoos.com refuses a previously valid room token after permission changes,
 * preventing stale browser authority from outliving the owner's current covenant.
 */
test("accepts current grant and rejects stale permission-version ticket", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-room-upgrade-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require(
			"../../../../../geelooy/api/tunnel/control/core/store.js"
		);
		const { issueTicket, clearTickets } = require(
			"../../../../../geelooy/api/tunnel/control/missionRooms/ticketStore.js"
		);
		const { authorizeMissionRoomUpgrade } = require("./upgradePolicy.js");
		clearTickets();
		writeStore(storeFixture(4));
		const current = authorizeMissionRoomUpgrade(
			request(issueTicket(ticketRecord()).token),
			identity()
		);
		assert.equal(current.ok, true);
		writeStore(storeFixture(5));
		const stale = authorizeMissionRoomUpgrade(
			request(issueTicket(ticketRecord()).token),
			identity()
		);
		assert.equal(stale.ok, false);
		assert.equal(stale.error, "mission_room_permission_changed");
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
});

function identity() {
	return {
		accountId: "account-b",
		userId: "user-b",
		sessionId: "session-b"
	};
}

function request(token) {
	return {
		url: `/api/tunnel/control/mission-room/ws?ticket=${token}&tunnelName=alpha&missionId=mission-a&protocolVersion=1`,
		headers: {
			origin: "https://awtsmoos.com",
			"sec-websocket-key": "proof-key"
		}
	};
}

function ticketRecord() {
	return {
		origin: "https://awtsmoos.com",
		accountId: "account-b",
		userId: "user-b",
		sessionId: "session-b",
		ownerAccountId: "account-a",
		tunnelId: "tun_a",
		tunnelName: "alpha",
		missionId: "mission-a",
		roomId: "mission-a",
		protocolVersion: 1,
		permissionVersion: 4,
		revocationVersion: 2
	};
}

function storeFixture(permissionVersion) {
	return {
		tunnelBindings: {
			tun_a: provenBinding({
				tunnelId: "tun_a",
				tunnelName: "alpha",
				deviceId: "device-a",
				ownerAccountId: "account-a",
				permissionVersion: 3,
				revocationVersion: 2
			})
		},
		tunnelGrants: {
			grant_b: {
				grantId: "grant_b",
				tunnelId: "tun_a",
				ownerAccountId: "account-a",
				granteeAccountId: "account-b",
				permissions: ["tunnel.mission"],
				permissionVersion,
				expiresAt: null,
				revokedAt: null
			}
		},
		tunnelPairings: {},
		tunnelAudit: []
	};
}
