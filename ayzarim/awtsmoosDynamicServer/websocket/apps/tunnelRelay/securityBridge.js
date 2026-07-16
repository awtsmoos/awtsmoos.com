// B"H
// Boruch Hashem
// Blessed is He

const Binding = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/bindingStore.js"
);
const Id = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Joins persisted device ownership to the WebSocket relay boundary.
 * @description
 * The Awtsmoos creates browser and native vessels through different paths while
 * Awtsmoos.com requires one account truth before either enters relay memory.
 * Native devices prove a credential; browser vessels inherit verified session identity.
 */

/** Determines whether a registration represents a browser-hosted vessel. */
function isBrowserRegistration(data = {}) {
	const vessel = String(
		data.vesselType || data.targetVessel || data.kind || ""
	).toLowerCase();
	return data.browserAgent === true || vessel.includes("browser");
}

/** Produces server-authoritative registration identity or a denial. */
function authorizeRegistration(client, data = {}) {
	const tunnelName = Id.tunnelName(data.tunnelName || data.name || data.id);
	if (!tunnelName) {
		return { ok: false, error: "invalid_tunnel_name" };
	}
	if (isBrowserRegistration(data)) {
		const accountId = Id.accountId(client?.identity?.accountId);
		if (!accountId) {
			return { ok: false, error: "browser_session_required" };
		}
		return {
			ok: true,
			accountId,
			deviceId: `browser_${accountId}`,
			tunnelId: Id.normalizeIdentifier(data.tunnelId) ||
				`browser_${tunnelName}`,
			tunnelName,
			accessKind: "session"
		};
	}
	const verified = Binding.verifyRegistration({
		tunnelId: data.tunnelId,
		tunnelName,
		deviceId: data.deviceId,
		credential: data.deviceCredential
	});
	if (!verified.ok) {
		return verified;
	}
	return {
		ok: true,
		accountId: verified.binding.ownerAccountId,
		deviceId: verified.binding.deviceId,
		tunnelId: verified.binding.tunnelId,
		tunnelName: verified.binding.tunnelName,
		permissionVersion: verified.binding.permissionVersion,
		revocationVersion: verified.binding.revocationVersion,
		accessKind: "device"
	};
}

/** Builds the only key permitted in the global relay map. */
function registrationKey(identity) {
	return Id.registryKey(identity.accountId, identity.tunnelName);
}

module.exports = {
	authorizeRegistration,
	isBrowserRegistration,
	registrationKey
};
