// B"H
// Boruch Hashem
// Blessed is He

const Coherence = require("./keyCoherence.js");
const Kinds = require("./identitySlotKinds.js");
const Match = require("./identitySlotMatch.js");
const Metadata = require("./metadata.js");
const Provenance = require("./identityProvenance.js");
const Rollback = require("./identitySlotRollback.js");
const SecureStore = require("./secureStore.js");
const Store = require("./identitySlotStore.js");
const Verification = require("./identitySlotVerification.js");

/**
 * @file Promotes one complete identity generation only after provenance and secret readback.
 * @description
 * The Awtsmoos binds key, credential, environment, and testimony in one covenant.
 * Awtsmoos.com records no raw secret in the slot file and refuses to capture a
 * fixture identity into a production last-known-good vessel.
 */
function capture(config = {}, details = {}) {
	const active = inspectActive(config);
	if (!active.ok) return active;
	const existing = Match.inspect(config, active);
	if (existing.ok) return existing;
	const previous = Rollback.snapshot(config);
	try {
		SecureStore.write(active.deviceId, Kinds.SLOT_PRIVATE_KEY, active.privateKey);
		SecureStore.write(active.deviceId, Kinds.SLOT_CREDENTIAL, active.credential);
		Store.write(config, testimony(active, details));
		const verified = Verification.verify(config, active);
		if (!verified.ok) return rejected(config, previous, active.deviceId, verified.code);
		return { ok: true, state: "captured", changed: true, slot: verified.slot };
	} catch (error) {
		return rejected(config, previous, active.deviceId, safeCode(error));
	}
}

function inspectActive(config) {
	const metadata = Metadata.read(config);
	if (!metadata?.deviceId || !metadata.tunnelId) return failure("capture_identity_missing");
	const provenance = Provenance.inspect(metadata);
	if (!provenance.ok) return failure(provenance.reason);
	const privateKey = SecureStore.read(metadata.deviceId, "private-key");
	const credential = SecureStore.read(metadata.deviceId, "credential");
	const coherence = Coherence.inspect(metadata, privateKey);
	if (!coherence.ok) return failure(coherence.code || "capture_private_key_invalid");
	if (!credential) return failure("capture_credential_missing");
	return {
		ok: true,
		deviceId: metadata.deviceId,
		tunnelId: metadata.tunnelId,
		privateKey,
		credential,
		publicKey: coherence.publicKey,
		publicKeyFingerprint: coherence.fingerprint,
		credentialVersion: Number(metadata.credentialVersion || 0),
		identityGeneration: Number(metadata.identityGeneration || 0),
		environment: provenance.actual
	};
}

function testimony(active, details) {
	return {
		capturedAt: new Date().toISOString(),
		deviceId: active.deviceId,
		tunnelId: active.tunnelId,
		publicKey: active.publicKey,
		publicKeyFingerprint: active.publicKeyFingerprint,
		credentialHash: Kinds.digest(active.credential),
		credentialVersion: active.credentialVersion,
		identityGeneration: active.identityGeneration,
		environment: String(details.environment || active.environment),
		runtimeVersion: String(details.version || ""),
		registeredPid: Number(details.pid || 0) || null,
		source: String(details.source || "runtime_healthy")
	};
}

function rejected(config, previous, deviceId, code) {
	const rollback = Rollback.restore(config, previous, deviceId);
	return { ok: false, state: "capture_rejected", changed: false, code, rollback };
}

function failure(code) {
	return { ok: false, state: "capture_incoherent", changed: false, code };
}

function safeCode(error) {
	return String(error?.code || error?.message || "capture_write_failed").slice(0, 160);
}

module.exports = { capture, inspectActive };
