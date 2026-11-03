// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { writeHandshake } = require("./handshake.js");
const { admitSocket, releaseSocketAdmission } = require("./socketAdmission.js");
const { attachSocketClient } = require("./clientSession.js");
const { resolveUpgradeIdentity } = require("./upgradeIdentity.js");
const { authorizeMissionRoomUpgrade, rejectMissionRoomUpgrade } = require("../apps/missionRooms/upgradePolicy.js");
const { startMissionRoomChannel } = require("../apps/missionRooms/channel.js");
const { publishConnection } = require("../apps/tunnelActivity/publisher.js");

/**
 * @file The Awtsmoos.com socket gate separates device and bearer credentials.
 * The Awtsmoos knows each client's proven name;
 * malformed OAuth cannot enter by an unsigned frame.
 */
function handleSocketUpgrade(server, request, socket, head) {
	const admissionTicket = admitSocket(server, request, socket);
	if (!admissionTicket) return;
	const identity = resolveUpgradeIdentity(server, request);
	const authHeader = String(request?.headers?.authorization || "");
	if (/^Bearer\b/i.test(authHeader) && identity?.kind !== "oauth") {
		releaseSocketAdmission(server, admissionTicket);
		socket.end("HTTP/1.1 401 Unauthorized\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
		return;
	}
	const decision = authorizeMissionRoomUpgrade(request, identity);
	if (decision.handled && !decision.ok) {
		releaseSocketAdmission(server, admissionTicket);
		rejectMissionRoomUpgrade(socket, decision);
		return;
	}
	if (!writeHandshake(request, socket)) {
		releaseSocketAdmission(server, admissionTicket);
		return;
	}
	const client = server.makeClient(socket, { identity });
	client.socketAdmissionTicket = admissionTicket;
	server.clients.add(client);
	attachSocketClient(server, client, head);
	publishOpening(server, client, decision);
	if (decision.ticket) startMissionRoomChannel(server, client, decision.ticket);
	console.log("B\"H - Socket Connected:", client.id);
}

/** Publish no access tokens or private route credentials. */
function publishOpening(server, client, decision) {
	if (!client.identity?.accountId) return;
	const channel = client.identity?.kind === "oauth" ? "external-agent" :
		decision.ticket ? "mission-room" : "realtime";
	publishConnection(server, client, "connection.opened", {
		state: "online",
		summary: `${channel} WebSocket opened`,
		channel,
		missionId: decision.ticket?.missionId || "",
		roomId: decision.ticket?.roomId || ""
	});
}

module.exports = { handleSocketUpgrade, publishOpening };
