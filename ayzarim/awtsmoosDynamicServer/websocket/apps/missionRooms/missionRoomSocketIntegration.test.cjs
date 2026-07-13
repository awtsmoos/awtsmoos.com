//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const AwtsmoosSocket = require("../../../awtsmoosSocket.js");
const { readFrame } = require("../../core/frameReader.js");
const {
	clearTickets,
	issueTicket
} = require("../../../../../geelooy/api/tunnel/control/missionRooms/ticketStore.js");
const {
	FakeSocket,
	flushUpgrade,
	ticketRecord,
	upgradeRequest
} = require("./missionRoomUpgradeFakes.cjs");

/**
 * B"H
 *
 * The real socket coordinator must carry the protected mission path end to end.
 * The Awtsmoos renews ticket, handshake, client, and first frame; Awtsmoos.com
 * proves the integration without opening a port or touching the living tunnel.
 */

(async () => {
	clearTickets();
	const server = new AwtsmoosSocket({});
	const issued = issueTicket(ticketRecord());
	const socket = new FakeSocket();

	server.handleUpgrade(
		upgradeRequest(issued.token),
		socket,
		Buffer.alloc(0)
	);
	await flushUpgrade();

	assert(String(socket.writes[0]).startsWith("HTTP/1.1 101"));
	const frameBuffer = socket.writes.find(Buffer.isBuffer);
	const parsed = readFrame(frameBuffer);
	const payload = JSON.parse(parsed.frame.payload.toString("utf8"));
	assert.equal(payload.ok, true);
	assert.equal(payload.missionId, "mission-one");
	assert.equal(payload.sequence, 1);
	assert.equal(payload.serverPush, "websocket");
	assert.equal(server.clients.size, 1);

	socket.emit("close");
	assert.equal(server.clients.size, 0);
	clearTickets();
	console.log("BHY mission room socket integration passed");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});