// B"H
// Boruch Hashem
// Blessed is He

const Id = require("./identifiers.js");
const Provenance = require("./bindingProvenance.js");
const Secrets = require("./secrets.js");

/**
 * @file Renews one possession-proven physical device without changing its tunnel ID.
 * @description
 * The Awtsmoos renews every instant without multiplying the essence being renewed.
 * Awtsmoos.com therefore rotates authorization inside one trusted binding when the
 * owner, device ID, and public possession key still testify to the same vessel.
 */
function renewExisting(store, input = {}) {
	const candidates = activeCandidates(store, input.deviceId);
	if (!candidates.length) return null;
	if (candidates.length !== 1) {
		throw conflict("ambiguous_device_binding");
	}
	const binding = candidates[0];
	assertSameIdentity(binding, input);
	const proof = Provenance.proofFields(input);
	if (!proof) throw conflict("invalid_tunnel_ownership_proof");
	const renewedAt = new Date().toISOString();
	Object.assign(binding, {
		tunnelName: Id.tunnelName(input.tunnelName),
		credentialDigest: Secrets.digest(input.credential),
		deviceName: String(input.deviceName || binding.deviceName || "Tunnel Device").slice(0, 160),
		platform: String(input.platform || binding.platform || "unknown").slice(0, 80),
		...proof,
		lastCredentialRenewedAt: renewedAt,
		lastAuthenticatedAt: null
	});
	if (!Provenance.isTrustedBinding(binding)) {
		throw conflict("invalid_tunnel_binding");
	}
	return binding;
}

function activeCandidates(store = {}, deviceId) {
	const normalizedDeviceId = Id.deviceId(deviceId);
	return Object.values(store.tunnelBindings || {}).filter(binding => {
		return Provenance.isTrustedBinding(binding) &&
			binding.deviceId === normalizedDeviceId;
	});
}

function assertSameIdentity(binding, input) {
	const ownerAccountId = Id.accountId(input.ownerAccountId);
	const publicKey = String(input.devicePublicKey || "").trim();
	if (!ownerAccountId || binding.ownerAccountId !== ownerAccountId) {
		throw conflict("device_binding_owner_mismatch");
	}
	if (!publicKey || binding.devicePublicKey !== publicKey) {
		throw conflict("device_binding_key_mismatch");
	}
	if (!Id.tunnelName(input.tunnelName)) {
		throw conflict("invalid_tunnel_name");
	}
}

function conflict(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	activeCandidates,
	assertSameIdentity,
	conflict,
	renewExisting
};
