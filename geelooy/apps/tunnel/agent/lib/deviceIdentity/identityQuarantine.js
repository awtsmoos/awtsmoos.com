// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Creation = require("./identityCreationAuthority.js");
const Failure = require("./identityFailure.js");
const Forget = require("./forget.js");
const Metadata = require("./metadata.js");

/**
 * @file Archives a wounded witness but permits physical reset only by explicit human force.
 * @description
 * The Awtsmoos remembers each fracture without making fracture a decree;
 * Awtsmoos.com grants one new witness only after deliberate reset completes cleanly.
 */
function reset(config = {}, error = null, options = {}) {
	assertForceReset(options);
	const metadata = Metadata.read(config) || {};
	const classification = Failure.classify(error);
	const evidence = buildEvidence(metadata, classification, error);
	const evidencePath = writeEvidence(config, evidence);
	const forgotten = Forget.forget(config, { forceReset: true });
	if (forgotten.secretCleanupComplete === false) {
		const failure = new Error("identity_reset_cleanup_incomplete");
		failure.code = "identity_reset_cleanup_incomplete";
		failure.forgotten = forgotten;
		failure.evidencePath = evidencePath;
		throw failure;
	}
	const creationGrant = Creation.grant(config, classification.code);
	return {
		ok: true,
		state: "identity_quarantined",
		reason: classification.code,
		evidencePath,
		forgotten,
		creationGrant
	};
}

function assertForceReset(options = {}) {
	if (options.forceReset === true) return;
	const error = new Error("physical_identity_reset_requires_force");
	error.code = "physical_identity_reset_requires_force";
	throw error;
}

function buildEvidence(metadata, classification, error) {
	return {
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
}

function writeEvidence(config, evidence) {
	const root = path.join(Metadata.recoveryRoot(config), "diagnostics", "identity-quarantine");
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
