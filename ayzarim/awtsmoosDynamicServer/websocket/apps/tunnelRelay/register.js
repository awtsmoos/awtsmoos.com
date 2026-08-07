// B"H
// Boruch Hashem
// Blessed is He

const { ensureServerState } = require("../../platform/ServerState.js");
const Authority = require("./registrationAuthority.js");
const Probe = require("./registrationProbe.js");
const Publication = require("./registrationPublication.js");
const RequestAck = require("./requestAckHandler.js");
const RequestDispatch = require("./requestDispatch.js");
const Security = require("./securityBridge.js");
const Transfer = require("./registrationTransfer.js");

/**
 * @file Admits account-bound devices while keeping probe and ownership distinct.
 * @description
 * The Awtsmoos may let a staged vessel prove the same key beside its incumbent.
 * Awtsmoos.com authenticates both, yet only ordinary registration may enter the live
 * registry, receive user work, or close the generation that currently owns the route.
 */
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
	if (Probe.requested(data)) {
		return Probe.acknowledge(client, identity, previous);
	}
	const decision = Authority.decide(previous, contenderDescriptor(client, data));
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
	Publication.acknowledge(client, identity, descriptor, replaced);
	RequestDispatch.recoverPending(state, client);
	RequestAck.monitorAccepted(state, client);
	Publication.publish(server, client, descriptor, replaced);
	return true;
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
