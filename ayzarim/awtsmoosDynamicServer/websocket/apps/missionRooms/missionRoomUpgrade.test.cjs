//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { writeHandshake } = require("../../core/handshake.js");
const {
	authorizeMissionRoomUpgrade,
	rejectMissionRoomUpgrade
} = require("./upgradePolicy.js");
const {
	writeStore
} = require(
	"../../../../../geelooy/api/tunnel/control/core/store.js"
);
const {
	clearTickets,
	issueTicket
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/ticketStore.js");
const {
	authorizationStore,
	FakeSocket,
	identityRecord,
	ticketRecord,
	upgradeRequest
} = require("./missionRoomUpgradeFakes.cjs");

/**
 * B"H
 *
 * The protected gate is proven without importing broken unrelated relays. The
 * Awtsmoos renews origin, ticket, handshake, and denial; Awtsmoos.com verifies
 * each boundary before a mission frame may enter the raw socket.
 */

const directory = fileSystem.mkdtempSync(path.join(os.tmpdir(), "mission-upgrade-"));
process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");

try {
	clearTickets();
	writeStore(authorizationStore());
	const identity = identityRecord();
	const accepted = issueTicket(ticketRecord());
	const acceptedRequest = upgradeRequest(accepted.token);
	const acceptedDecision = authorizeMissionRoomUpgrade(acceptedRequest, identity);
	assert.equal(acceptedDecision.ok, true);
	assert.equal(acceptedDecision.ticket.userId, "user-one");

	const acceptedSocket = new FakeSocket();
	assert.equal(writeHandshake(acceptedRequest, acceptedSocket), true);
	assert(String(acceptedSocket.writes[0]).startsWith("HTTP/1.1 101"));

	const replayDecision = authorizeMissionRoomUpgrade(acceptedRequest, identity);
	assert.equal(replayDecision.ok, false);
	assert.equal(replayDecision.status, 401);
	assert.equal(replayDecision.error, "ticket_missing_or_used");

	const foreign = issueTicket(ticketRecord());
	const foreignDecision = authorizeMissionRoomUpgrade(
		upgradeRequest(foreign.token, "https://evil.example"),
		identity
	);
	assert.equal(foreignDecision.ok, false);
	assert.equal(foreignDecision.status, 403);
	assert.equal(foreignDecision.error, "ticket_origin_mismatch");

	const wrongVersion = issueTicket(ticketRecord());
	const wrongVersionRequest = upgradeRequest(wrongVersion.token);
	wrongVersionRequest.url = wrongVersionRequest.url.replace(
		"protocolVersion=1",
		"protocolVersion=2"
	);
	const versionDecision = authorizeMissionRoomUpgrade(wrongVersionRequest, identity);
	assert.equal(versionDecision.ok, false);
	assert.equal(versionDecision.status, 409);

	const missingOrigin = issueTicket(ticketRecord());
	const missingOriginRequest = upgradeRequest(missingOrigin.token);
	delete missingOriginRequest.headers.origin;
	const originDecision = authorizeMissionRoomUpgrade(missingOriginRequest, identity);
	assert.equal(originDecision.status, 403);
	assert.equal(originDecision.error, "missing_websocket_origin");

	const missingKey = issueTicket(ticketRecord());
	const missingKeyRequest = upgradeRequest(missingKey.token);
	delete missingKeyRequest.headers["sec-websocket-key"];
	const keyDecision = authorizeMissionRoomUpgrade(missingKeyRequest, identity);
	assert.equal(keyDecision.status, 400);
	assert.equal(keyDecision.error, "missing_websocket_key");

	const unauthenticated = issueTicket(ticketRecord());
	const authDecision = authorizeMissionRoomUpgrade(
		upgradeRequest(unauthenticated.token)
	);
	assert.equal(authDecision.status, 401);
	assert.equal(authDecision.error, "mission_room_authentication_required");

	const rejectedSocket = new FakeSocket();
	rejectMissionRoomUpgrade(rejectedSocket, replayDecision);
	assert(String(rejectedSocket.writes[0]).includes("401 Unauthorized"));
	assert.equal(rejectedSocket.destroyed, true);

	console.log("BHY mission room upgrade policy tests passed");
} finally {
	clearTickets();
	fileSystem.rmSync(directory, { recursive: true, force: true });
	delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
}
