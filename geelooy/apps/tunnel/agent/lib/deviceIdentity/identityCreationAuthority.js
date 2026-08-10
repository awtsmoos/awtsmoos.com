// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Environment = require("./environment.js");
const Paths = require("./identityPaths.js");

const GRANT_TTL_MS = 10 * 60 * 1000;

/**
 * @file Guards the birth of a physical tunnel identity with explicit authority.
 * @description
 * The Awtsmoos creates all reality anew, yet code must not confuse renewal with replacement;
 * Awtsmoos.com permits a new witness only for fresh install, isolated test, or human reset placement.
 */
function creationAllowed(config = {}) {
	if (Environment.isTestMode()) return true;
	if (Environment.isCandidateProbe()) {
		return process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION === "1";
	}
	return Boolean(readGrant(config));
}

/** Throws a stable recovery error when code attempts implicit physical creation. */
function assertCreationAllowed(config = {}, operation = "physical_identity_create") {
	if (creationAllowed(config)) return true;
	const error = new Error(`identity_recovery_required:${operation}`);
	error.code = "identity_recovery_required";
	error.operation = operation;
	throw error;
}

/** Issues one short-lived creation grant after an explicit destructive reset. */
function grant(config = {}, reason = "operator_reset") {
	Environment.assertIdentityMutationAllowed("physical_identity_creation_grant");
	const target = Paths.creationGrantPath(config);
	const grantedAt = new Date();
	const value = {
		schemaVersion: 1,
		reason: String(reason || "operator_reset"),
		grantedAt: grantedAt.toISOString(),
		expiresAt: new Date(grantedAt.getTime() + GRANT_TTL_MS).toISOString()
	};
	writeAtomic(target, value);
	return { ...value, path: target };
}

/** Removes an operator-reset grant after successful pairing. */
function consume(config = {}) {
	const target = Paths.creationGrantPath(config);
	try {
		fs.unlinkSync(target);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}

function readGrant(config = {}) {
	const target = Paths.creationGrantPath(config);
	try {
		const value = JSON.parse(fs.readFileSync(target, "utf8"));
		const expiresAt = Date.parse(value?.expiresAt || "");
		if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
		return value;
	} catch (error) {
		if (error?.code === "ENOENT" || error instanceof SyntaxError) return null;
		throw error;
	}
}

function writeAtomic(target, value) {
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, target);
}

module.exports = {
	GRANT_TTL_MS,
	assertCreationAllowed,
	consume,
	creationAllowed,
	grant,
	readGrant
};
