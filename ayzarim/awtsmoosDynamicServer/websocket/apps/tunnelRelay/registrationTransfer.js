// B"H
// Boruch Hashem
// Blessed is He

const { sendJson } = require("../wsUtilities.js");
const { bool, cleanText } = require("./normalizers.js");
const { registrationDescriptor } = require("./registrationDescriptor.js");
const { ensureServerState } = require("../../platform/ServerState.js");

/**
 * @file Applies only server-authorized relay registration identity.
 * @description
 * The Awtsmoos renews connection and registry without confusing appearance with
 * ownership. Awtsmoos.com copies account, tunnel, and device identity only from
 * the verified security bridge and never from an untrusted registration packet.
 */

/** Closes one relay connection without assuming a particular socket library. */
function closeConnection(client, code = 4001, reason = "Connection replaced") {
	if (typeof client?.close === "function") {
		client.close(code, reason);
		return;
	}
	client?.socket?.end?.();
}

/** Closes the prior connection within the same account-scoped registry key. */
function closePrevious(server, registrationKey, client, tunnelName) {
	const state = ensureServerState(server);
	const previous = state.tunnels.get(registrationKey);
	if (!previous || previous === client) {
		return null;
	}
	try {
		sendJson(previous, {
			type: "TUNNEL_REPLACED",
			tunnelName,
			reason: "new-connection"
		});
	} catch {}
	try {
		closeConnection(previous);
	} catch {}
	state.clients.delete(previous);
	return previous;
}

/** Applies bounded metadata plus authoritative identity to the accepted socket. */
function apply(server, client, data, identity, registrationKey) {
	const descriptor = registrationDescriptor(data);
	const registeredAt = Date.now();
	server.tunnelRegistrationGeneration = Number(
		server.tunnelRegistrationGeneration || 0
	) + 1;
	Object.assign(client, descriptor, {
		accountId: identity.accountId,
		accessKind: identity.accessKind,
		agentVersion: cleanText(data.agentVersion, "unknown"),
		allowCommands: bool(data.allowCommands) || data.allowCommands === "limited",
		allowSecrets: bool(data.allowSecrets),
		allowWrite: bool(data.allowWrite),
		deviceId: identity.deviceId,
		deviceName: cleanText(data.deviceName, "Tunnel Device"),
		isTunnel: true,
		permissionVersion: Number(identity.permissionVersion || 1),
		registeredAt,
		registrationGeneration: server.tunnelRegistrationGeneration,
		registrationKey,
		revocationVersion: Number(identity.revocationVersion || 1),
		tunnelId: identity.tunnelId,
		tunnelName: identity.tunnelName,
		tunnelRegisteredAt: new Date(registeredAt).toISOString()
	});
	return descriptor;
}

/** Rejects an unauthenticated registration and removes its socket authority. */
function rejectSecurity(server, client, error) {
	const state = ensureServerState(server);
	try {
		sendJson(client, {
			type: "TUNNEL_ACK",
			ok: false,
			error
		});
	} finally {
		state.clients.delete(client);
		try {
			closeConnection(client, 4003, "Tunnel authentication failed");
		} catch {}
	}
	return false;
}

/** Rejects a lower-authority connection within the same account boundary. */
function reject(server, client, tunnelName, decision, previous) {
	const state = ensureServerState(server);
	try {
		sendJson(client, {
			type: "TUNNEL_ACK",
			ok: false,
			error: "lower_authority_tunnel_owner_active",
			tunnelName,
			reason: decision.reason,
			incumbentProtocolVersion: previous?.protocolVersion || "legacy"
		});
	} finally {
		state.clients.delete(client);
		try {
			closeConnection(client, 4003, "Higher-authority tunnel active");
		} catch {}
	}
	return false;
}

module.exports = {
	apply,
	closeConnection,
	closePrevious,
	reject,
	rejectSecurity
};
