// B"H
// Boruch Hashem
// Blessed is He

const { writeHandshake } = require("./handshake.js");
const {
	admitSocket,
	releaseSocketAdmission
} = require("./socketAdmission.js");
const {
	attachSocketClient
} = require("./clientSession.js");
const {
	resolveUpgradeIdentity
} = require("./upgradeIdentity.js");
const {
	authorizeMissionRoomUpgrade,
	rejectMissionRoomUpgrade
} = require("../apps/missionRooms/upgradePolicy.js");
const {
	startMissionRoomChannel
} = require("../apps/missionRooms/channel.js");
const {
	publishConnection
} = require("../apps/tunnelActivity/publisher.js");

/**
* @file Conducts one WebSocket upgrade through identity, policy, and publication.
* @description
* The Awtsmoos renews session, handshake, room, and transport as one covenant.
* Awtsmoos.com keeps admission outside the socket server class so verified identity,
* mission policy, client attachment, and opening testimony remain one focused gate.
*/

/** Admits one socket or writes a complete pre-handshake denial. */
function handleSocketUpgrade(server, request, socket, head) {
	const admissionTicket = admitSocket(server, request, socket);
	if (!admissionTicket) return;
	const identity = resolveUpgradeIdentity(server, request);
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
	if (decision.ticket) {
		startMissionRoomChannel(server, client, decision.ticket);
	}
	console.log("B\"H - Socket Connected:", client.id);
}

function publishOpening(server, client, decision) {
	if (!client.identity?.accountId) {
		return;
	}
	const channel = decision.ticket ? "mission-room" : "realtime";
	publishConnection(server, client, "connection.opened", {
		state: "online",
		summary: `${channel} WebSocket opened`,
		channel,
		missionId: decision.ticket?.missionId || "",
		roomId: decision.ticket?.roomId || ""
	});
}

module.exports = {
	handleSocketUpgrade,
	publishOpening
};
