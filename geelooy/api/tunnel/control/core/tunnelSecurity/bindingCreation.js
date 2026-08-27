// B"H
// Boruch Hashem
// Blessed is He

const Id = require("./identifiers.js");
const Lifecycle = require("./bindingLifecycle.js");
const Provenance = require("./bindingProvenance.js");
const Retention = require("./bindingRetention.js");
const Secrets = require("./secrets.js");

/**
 * @file Creates authority only for a truly new possession-proven device.
 * @description
 * The Awtsmoos reveals a new vessel only when no living covenant already bears
 * that physical identity. Awtsmoos.com keeps fresh creation separate from renewal,
 * so authorization rotation cannot multiply tunnel identities by accident.
 */
function createFresh(store, input = {}) {
	const proof = Provenance.proofFields(input);
	if (!proof) throw new Error("invalid_tunnel_ownership_proof");
	const now = new Date().toISOString();
	const binding = {
		tunnelId: `tun_${Secrets.randomToken(18)}`,
		tunnelName: Id.tunnelName(input.tunnelName),
		deviceId: Id.deviceId(input.deviceId),
		ownerAccountId: Id.accountId(input.ownerAccountId),
		credentialDigest: Secrets.digest(input.credential),
		devicePublicKey: String(input.devicePublicKey || "").trim(),
		deviceName: String(input.deviceName || "Tunnel Device").slice(0, 160),
		platform: String(input.platform || "unknown").slice(0, 80),
		...proof,
		keyVersion: 1,
		permissionVersion: 1,
		revocationVersion: 1,
		createdAt: now,
		lastAuthenticatedAt: null,
		revokedAt: null
	};
	if (!Provenance.isTrustedBinding(binding)) {
		throw new Error("invalid_tunnel_binding");
	}
	binding.supersededTunnelIds = Lifecycle.supersedeDuplicates(store, binding, now);
	store.tunnelBindings[binding.tunnelId] = binding;
	binding.retention = Retention.pruneStore(store, {
		accountId: binding.ownerAccountId,
		at: now
	}).removed.map(item => item.tunnelId);
	return binding;
}

module.exports = { createFresh };
