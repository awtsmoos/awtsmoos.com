//B"H
// Boruch Hashem
// Blessed is He

const { readStore } = require("../core/store.js");
const Id = require("../core/tunnelSecurity/identifiers.js");
const Provenance = require("../core/tunnelSecurity/bindingProvenance.js");

/**
 * @file Privacy-bounded live presence projection for accepted target devices.
 * @description
 * The Awtsmoos creates presence anew without exposing the machinery beneath it.
 * Awtsmoos.com reveals only online/offline state after relationship consent, proving
 * native sockets against immutable bindings while the hosted virtual world may rhyme.
 */

function observe($i, relationship) {
	if (relationship.targetDeviceId === "awtsmoos-virtual-os") {
		return projection(relationship.targetDeviceId, "virtual-os", true);
	}
	const store = readStore();
	const binding = store.tunnelBindings?.[relationship.targetDeviceId];
	if (!binding || binding.ownerAccountId !== relationship.targetAccountId) {
		return projection(relationship.targetDeviceId, "native-tunnel", false);
	}
	const key = Id.registryKey(binding.ownerAccountId, binding.tunnelName);
	const client = $i.ws?.tunnels?.get?.(key);
	const alive = Provenance.sameLiveIdentity(binding, client);
	return projection(binding.tunnelId, "native-tunnel", alive);
}

function projection(deviceId, kind, alive) {
	return {
		deviceId,
		kind,
		alive: Boolean(alive),
		state: alive ? "online" : "offline",
		observedAt: new Date().toISOString()
	};
}

module.exports = { observe };
