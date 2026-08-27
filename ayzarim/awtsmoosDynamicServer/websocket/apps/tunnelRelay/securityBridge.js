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
 * @file Joins persisted ownership to an immutable account-scoped relay identity.
 * @description
 * The Awtsmoos renews account, device, name, and route without confusing display
 * with authority. Awtsmoos.com verifies native possession or browser session, then
 * keys relay memory by account plus tunnel ID so renames never orphan a live vessel.
 */
function isBrowserRegistration(data = {}) {
	const vessel = String(
		data.vesselType || data.targetVessel || data.kind || ""
	).toLowerCase();
	return data.browserAgent === true || vessel.includes("browser");
}

function authorizeRegistration(client, data = {}) {
	const tunnelName = Id.tunnelName(data.tunnelName || data.name || data.id);
	if (!tunnelName) return denial("invalid_tunnel_name");
	if (isBrowserRegistration(data)) {
		return authorizeBrowser(client, data, tunnelName);
	}
	const verified = Binding.verifyRegistration({
		tunnelId: data.tunnelId,
		tunnelName,
		deviceId: data.deviceId,
		credential: data.deviceCredential
	});
	if (!verified.ok) return verified;
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

function authorizeBrowser(client, data, tunnelName) {
	const accountId = Id.accountId(client?.identity?.accountId);
	if (!accountId) return denial("browser_session_required");
	const tunnelId = Id.normalizeIdentifier(data.tunnelId) ||
		Id.normalizeIdentifier(`browser_${tunnelName}`);
	if (!tunnelId) return denial("invalid_browser_tunnel_id");
	return {
		ok: true,
		accountId,
		deviceId: Id.deviceId(data.deviceId) || `browser_${accountId}`,
		tunnelId,
		tunnelName,
		accessKind: "session"
	};
}

function registrationKey(identity = {}) {
	return Id.registryKey(identity.accountId, identity.tunnelId);
}

function denial(error) {
	return { ok: false, error };
}

module.exports = {
	authorizeBrowser,
	authorizeRegistration,
	isBrowserRegistration,
	registrationKey
};
