//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationPolicy
 * @description
 * Normalizes organization names, identifiers, project budget keys, and purchased
 * Peruta amounts before any treasury mutation crosses the Wallet lock.
 */

const crypto = require("crypto");
const ORGANIZATION_ID = /^org_[a-f0-9]{16}$/;
const PROJECT_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const RETRY_KEY = /^[A-Za-z0-9._:-]{8,160}$/;

/** Creates a compact opaque organization identifier. */
function createOrganizationId() {
	return "org_" + crypto.randomBytes(8).toString("hex");
}

/** Normalizes a human-readable organization or agency name. */
function organizationName(value) {
	const name = String(value || "").trim().replace(/\s+/g, " ");
	if (name.length < 2 || name.length > 80) {
		throw policyError("invalid_organization_name");
	}
	return name;
}

/** Validates a server-issued organization id. */
function organizationId(value) {
	const id = String(value || "").trim();
	if (!ORGANIZATION_ID.test(id)) {
		throw policyError("invalid_organization_id");
	}
	return id;
}

/** Normalizes a client/project budget key without path or markup semantics. */
function projectKey(value) {
	const key = String(value || "").trim();
	if (!PROJECT_KEY.test(key)) {
		throw policyError("invalid_project_budget_key");
	}
	return key;
}

/** Requires a positive integer number of atomic Perutas. */
function perutahs(value) {
	const amount = Number(value);
	if (!Number.isSafeInteger(amount) || amount <= 0) {
		throw policyError("invalid_perutah_amount");
	}
	return amount;
}

/** Normalizes the retry key guarding one treasury transition. */
function idempotencyKey(value) {
	const key = String(value || "").trim();
	if (!RETRY_KEY.test(key)) {
		throw policyError("invalid_idempotency_key");
	}
	return key;
}

/** Creates one policy-shaped error for route translation. */
function policyError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	createOrganizationId,
	idempotencyKey,
	organizationId,
	organizationName,
	perutahs,
	projectKey
};
