// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Environment = require("./environment.js");
const Paths = require("./identityPaths.js");

const GRANT_TTL_MS = 10 * 60 * 1000;
const FRESH_KIND = "fresh_install_once";

/**
 * @file Guards physical-identity birth through explicit reset or one exact fresh-install vessel.
 * @description The Awtsmoos renews reality without confusing renewal with replacement;
 * Awtsmoos.com lets a stopped fresh install retain one root-bound authority until successful pairing consumes it.
 */
function creationAllowed(config = {}) {
	if (Environment.isTestMode()) return true;
	if (Environment.isCandidateProbe()) {
		return process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION === "1";
	}
	return Boolean(readGrant(config));
}

function assertCreationAllowed(config = {}, operation = "physical_identity_create") {
	if (creationAllowed(config)) return true;
	const error = new Error(`identity_recovery_required:${operation}`);
	error.code = "identity_recovery_required";
	error.operation = operation;
	throw error;
}

/** Issues one short-lived grant after an explicit operator reset. */
function grant(config = {}, reason = "operator_reset") {
	Environment.assertIdentityMutationAllowed("physical_identity_creation_grant");
	const grantedAt = new Date();
	const value = {
		schemaVersion: 1,
		kind: "operator_reset",
		reason: String(reason || "operator_reset"),
		grantedAt: grantedAt.toISOString(),
		expiresAt: new Date(grantedAt.getTime() + GRANT_TTL_MS).toISOString()
	};
	return writeGrant(config, value);
}

/** Issues one persistent, root-bound authority for a verified fresh stopped install. */
function grantFreshInstall(config = {}, reason = "fresh_install") {
	Environment.assertIdentityMutationAllowed("fresh_install_identity_creation_grant");
	const value = {
		schemaVersion: 2,
		kind: FRESH_KIND,
		reason: String(reason || "fresh_install"),
		grantedAt: new Date().toISOString(),
		installRoot: Paths.installRoot(config),
		recoveryRoot: Paths.recoveryRoot(config),
		nonce: crypto.randomBytes(18).toString("base64url")
	};
	return writeGrant(config, value);
}

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
		if (value?.kind === FRESH_KIND) return validFreshGrant(config, value) ? value : null;
		const expiresAt = Date.parse(value?.expiresAt || "");
		if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
		return value;
	} catch (error) {
		if (error?.code === "ENOENT" || error instanceof SyntaxError) return null;
		throw error;
	}
}

function validFreshGrant(config, value) {
	if (value?.schemaVersion !== 2 || !value?.nonce || !value?.grantedAt) return false;
	if (!path.isAbsolute(String(value.installRoot || ""))) return false;
	if (!path.isAbsolute(String(value.recoveryRoot || ""))) return false;
	return path.resolve(value.installRoot) === Paths.installRoot(config) &&
		path.resolve(value.recoveryRoot) === Paths.recoveryRoot(config);
}

function writeGrant(config, value) {
	const target = Paths.creationGrantPath(config);
	writeAtomic(target, value);
	return { ...value, path: target };
}

function writeAtomic(target, value) {
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

module.exports = {
	FRESH_KIND,
	GRANT_TTL_MS,
	assertCreationAllowed,
	consume,
	creationAllowed,
	grant,
	grantFreshInstall,
	readGrant,
	validFreshGrant
};
