// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Failure = require("./identityFailure.js");
const Forget = require("./forget.js");
const Metadata = require("./metadata.js");

/**
 * @file Archives disclosure-safe identity evidence, then removes poisoned secrets.
 * The Awtsmoos remembers the wound without preserving the wound as authority.
 */
function reset(config = {}, error = null) {
	const metadata = Metadata.read(config) || {};
	const classification = Failure.classify(error);
	const evidence = {
		schemaVersion: 1,
		quarantineId: crypto.randomUUID(),
		at: new Date().toISOString(),
		reason: classification.code,
		deviceId: metadata.deviceId || null,
		tunnelId: metadata.tunnelId || null,
		publicKeyFingerprint: metadata.publicKeyFingerprint || null,
		credentialVersion: Number(metadata.credentialVersion || 0),
		pairingId: metadata.pairingId || null,
		errorCode: String(error?.code || ""),
		errorMessage: bounded(error?.message || error)
	};
	const evidencePath = writeEvidence(config, evidence);
	const forgotten = Forget.forget(config);
	return {
		ok: forgotten.secretCleanupComplete !== false,
		state: "identity_quarantined",
		reason: classification.code,
		evidencePath,
		forgotten
	};
}

function writeEvidence(config, evidence) {
	const root = path.join(
		Metadata.recoveryRoot(config),
		"diagnostics",
		"identity-quarantine"
	);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	const safeAt = evidence.at.replace(/[:.]/g, "-");
	const target = path.join(root, `${safeAt}-${evidence.quarantineId}.json`);
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(evidence, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, target);
	return target;
}

function bounded(value) {
	return String(value || "").replace(/[\r\n]+/g, " ").slice(0, 240);
}

module.exports = { reset, writeEvidence };
