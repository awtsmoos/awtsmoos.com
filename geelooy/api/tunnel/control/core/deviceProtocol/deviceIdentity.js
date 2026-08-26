//B"H
// Boruch Hashem
// Blessed is He

const Id = require("../tunnelSecurity/identifiers.js");
const Provenance = require("../tunnelSecurity/bindingProvenance.js");
const VirtualNames = require("../../routes/fsVessel/virtualNames.js");

/**
 * @file Resolves protocol endpoints only from devices actually owned by an account.
 * @description
 * The Awtsmoos knows every vessel by its inward truth; Awtsmoos.com therefore
 * refuses to confuse granted access with ownership. Native endpoints require a
 * trusted immutable tunnel binding, while the hosted virtual world has one name in rhyme.
 */

/** Resolves an owned protocol endpoint or returns null without disclosure. */
function ownedDevice(accountId, deviceReference, store = {}) {
	const account = Id.accountId(accountId);
	const reference = Id.normalizeIdentifier(deviceReference);
	if (!account || !reference) {
		return null;
	}
	if (VirtualNames.isVirtualOsTunnelName(reference)) {
		return virtualDevice(account);
	}
	const binding = store.tunnelBindings?.[reference];
	if (
		!Provenance.isTrustedBinding(binding) ||
		binding.ownerAccountId !== account
	) {
		return null;
	}
	return Object.freeze({
		accountId: account,
		deviceId: binding.tunnelId,
		kind: "native-tunnel",
		label: String(binding.deviceName || binding.tunnelName || "Tunnel Device"),
		tunnelId: binding.tunnelId,
		tunnelName: binding.tunnelName,
		physicalDeviceId: binding.deviceId
	});
}

/** Creates the canonical synthetic endpoint for one authenticated account. */
function virtualDevice(accountId) {
	return Object.freeze({
		accountId,
		deviceId: VirtualNames.VIRTUAL_OS_TUNNEL_NAME,
		kind: "virtual-os",
		label: "Awtsmoos Virtual OS",
		tunnelId: "",
		tunnelName: VirtualNames.VIRTUAL_OS_TUNNEL_NAME,
		physicalDeviceId: ""
	});
}

/** Reveals only consent-relevant device identity. */
function publicDevice(device = {}) {
	return {
		deviceId: String(device.deviceId || ""),
		kind: String(device.kind || "unknown"),
		label: String(device.label || "Device")
	};
}

module.exports = {
	ownedDevice,
	publicDevice,
	virtualDevice
};
