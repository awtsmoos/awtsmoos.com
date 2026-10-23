// B"H
"use strict";
const Id = require("../core/tunnelSecurity/identifiers.js");
const Provenance = require("../core/tunnelSecurity/bindingProvenance.js");

/**
 * @file Every vessel of the Awtsmoos enters its owner's common view.
 * Each socket is verified against its durable identity and never confused
 * with the individual AI who may or may not be operating its device.
 */
function devices(context, store, accountId) {
	const output = [];
	const seen = new Set();
	for (const binding of Object.values(store.tunnelBindings || {})) {
		if (!binding || binding.ownerAccountId !== accountId) continue;
		if (!binding.tunnelName || !binding.tunnelId || seen.has(binding.tunnelId)) continue;
		seen.add(binding.tunnelId);
		const key = Id.registryKey(accountId, binding.tunnelName);
		const client = context.ws?.tunnels?.get?.(key);
		const connected = Boolean(client && Provenance.sameLiveIdentity(binding, client));
		output.push({
			tunnelName: binding.tunnelName,
			tunnelId: binding.tunnelId,
			kind: "native-tunnel",
			state: connected ? "online" : "offline"
		});
	}
	return output.slice(0, 250);
}

function ownsTunnel(store, accountId, tunnelName) {
	if (!tunnelName) return true;
	return Object.values(store.tunnelBindings || {}).some(binding =>
		binding?.ownerAccountId === accountId && binding.tunnelName === tunnelName);
}

module.exports = { devices, ownsTunnel };
