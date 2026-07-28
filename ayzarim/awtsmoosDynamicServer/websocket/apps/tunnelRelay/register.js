// B"H
// Boruch Hashem
// Blessed is He

const { publishConnection } = require("../tunnelActivity/publisher.js");
const { sendJson } = require("../wsUtilities.js");
const { ensureServerState } = require("../../platform/ServerState.js");
const Authority = require("./registrationAuthority.js");
const RequestAck = require("./requestAckHandler.js");
const RequestDispatch = require("./requestDispatch.js");
const Security = require("./securityBridge.js");
const Transfer = require("./registrationTransfer.js");

/**
 * @file Admits account-bound devices and publishes their living connection state.
 * @description
 * The Awtsmoos renews contender and incumbent, yet Awtsmoos.com first proves the
 * owner account, then lets protocol authority choose within that account, and only
 * afterward reveals registration or replacement to the rightful realtime stream.
 */

/** Authenticates, scopes, registers, and announces one tunnel WebSocket. */
function handleTunnelRegister(server, client, data = {}) {
	const identity = Security.authorizeRegistration(client, data);
	if (!identity.ok) {
		return Transfer.rejectSecurity(server, client, identity.error);
	}
	const registrationKey = Security.registrationKey(identity);
	if (!registrationKey) {
		return Transfer.rejectSecurity(server, client, "invalid_registry_identity");
	}
	const state = ensureServerState(server);
	const previous = state.tunnels.get(registrationKey);
	const decision = Authority.decide(
		previous,
		contenderDescriptor(client, data)
	);
	if (decision.action === "fence") {
		return Transfer.reject(
			server,
			client,
			identity.tunnelName,
			decision,
			previous
		);
	}
	const replaced = decision.action === "replace"
		? Transfer.closePrevious(
			server,
			registrationKey,
			client,
			identity.tunnelName
		)
		: null;
	const descriptor = Transfer.apply(
		server,
		client,
		data,
		identity,
		registrationKey
	);
	state.tunnels.set(registrationKey, client);
	state.tunnelRegistrations.set(registrationKey, descriptor);
	state.clients.add(client);
	sendAcknowledgement(client, identity, descriptor, replaced);
	RequestDispatch.recoverPending(state, client);
	RequestAck.monitorAccepted(state, client);
	publishRegistration(server, client, descriptor, replaced);
	return true;
}

function sendAcknowledgement(client, identity, descriptor, replaced) {
	sendJson(client, {
		type: "TUNNEL_ACK",
		ok: true,
		accountBound: true,
		tunnelId: identity.tunnelId,
		tunnelName: identity.tunnelName,
		replacedOlderConnection: Boolean(replaced),
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		registrationGeneration: client.registrationGeneration,
		serverTime: new Date().toISOString()
	});
}

function publishRegistration(server, client, descriptor, replaced) {
	publishConnection(server, client, "connection.registered", {
		state: "connected",
		summary: `${client.deviceName || client.tunnelName} connected`,
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		agentVersion: client.agentVersion,
		replacedConnectionId: replaced?.id || ""
	});
	if (replaced) {
		publishConnection(server, replaced, "connection.replaced", {
			state: "replaced",
			severity: "notice",
			summary: `${replaced.deviceName || replaced.tunnelName} was replaced`
		});
	}
}

/** Builds protocol precedence without granting security authority. */
function contenderDescriptor(client, data) {
	return {
		client,
		agentVersion: data.agentVersion,
		browserAgent: data.browserAgent === true,
		protocolVersion: data.protocolVersion,
		vesselType: data.vesselType
	};
}

module.exports = {
	applyRegistration: Transfer.apply,
	closePreviousTunnel: Transfer.closePrevious,
	contenderDescriptor,
	handleTunnelRegister,
	rejectContender: Transfer.reject
};
