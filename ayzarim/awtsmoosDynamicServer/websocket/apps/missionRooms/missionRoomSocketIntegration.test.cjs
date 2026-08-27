//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const AwtsmoosSocket = require("../../../awtsmoosSocket.js");
const { readFrame } = require("../../core/frameReader.js");
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
	flushUpgrade,
	identityRecord,
	ticketRecord,
	upgradeRequest
} = require("./missionRoomUpgradeFakes.cjs");

/**
 * B"H
 *
 * The real socket coordinator must carry the protected mission path end to end.
 * FrameWriter intentionally writes a header and payload separately; the fake
 * socket therefore joins every binary write exactly as a kernel stream would.
 */

(async () => {
	const directory = fileSystem.mkdtempSync(
		path.join(os.tmpdir(), "mission-room-socket-")
	);
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		clearTickets();
		writeStore(authorizationStore());
		const server = new AwtsmoosSocket({});
		server.parseCookies = () => ({ session: "test" });
		server.auth = {
			authenticateCookies() {
				return {
					authorized: true,
					info: identityRecord()
				};
			}
		};
		const issued = issueTicket(ticketRecord());
		const socket = new FakeSocket();

		server.handleUpgrade(
			upgradeRequest(issued.token),
			socket,
			Buffer.alloc(0)
		);
		await flushUpgrade();

		assert(String(socket.writes[0]).startsWith("HTTP/1.1 101"));
		const binaryWrites = socket.writes.filter(Buffer.isBuffer);
		assert(binaryWrites.length >= 2);
		const parsed = readFrame(Buffer.concat(binaryWrites));
		assert(parsed?.frame);
		const payload = JSON.parse(parsed.frame.payload.toString("utf8"));
		assert.equal(payload.ok, true);
		assert.equal(payload.missionId, "mission-one");
		assert.equal(payload.sequence, 1);
		assert.equal(payload.serverPush, "websocket");
		assert.equal(server.clients.size, 1);

		socket.emit("close");
		assert.equal(server.clients.size, 0);
		console.log("BHY mission room socket integration passed");
	} finally {
		clearTickets();
		fileSystem.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
