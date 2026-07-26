//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceAliasPolicy
 * @description
 * The Awtsmoos gives one migration identity one owner, one quota vessel, and one
 * permission. Awtsmoos.com rejects broad scopes and ambiguous replay keys.
 */

const { normalizeScopes } = require('./credentialPolicy.js');

const SERVICE_SCOPES = Object.freeze(['drive.migrate']);
const SERVICE_QUOTA_PROFILE = 'service-migration';

function normalizeServiceAliasInput(value = {}) {
	const aliasId = requiredText(value.aliasId, 'SERVICE_ALIAS_ID_REQUIRED', 26);
	if (!/^[a-zA-Z0-9_$-]+$/.test(aliasId)) {
		throw policyError('SERVICE_ALIAS_ID_INVALID');
	}
	return {
		aliasId,
		aliasName: requiredText(value.aliasName, 'SERVICE_ALIAS_NAME_REQUIRED', 50),
		description: optionalText(value.description, 5784)
	};
}

function normalizeProvisioningIdempotencyKey(value) {
	const key = requiredText(value, 'SERVICE_IDEMPOTENCY_KEY_REQUIRED', 200);
	if (key.length < 8) throw policyError('SERVICE_IDEMPOTENCY_KEY_REQUIRED');
	return key;
}

function normalizeServiceAliasRequest(value = {}) {
	const alias = normalizeServiceAliasInput(value);
	const ownerUserId = requiredText(value.ownerUserId, 'SERVICE_OWNER_REQUIRED', 200);
	const idempotencyKey = normalizeProvisioningIdempotencyKey(value.idempotencyKey);
	const scopes = normalizeScopes(value.scopes || SERVICE_SCOPES);
	if (scopes.length !== 1 || scopes[0] !== SERVICE_SCOPES[0]) {
		throw policyError('SERVICE_SCOPE_INVALID');
	}
	return { ...alias, ownerUserId, idempotencyKey, scopes };
}

function requiredText(value, code, maximum) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum) throw policyError(code);
	return text;
}

function optionalText(value, maximum) {
	if (value === undefined || value === null) return '';
	const text = String(value).trim();
	if (text.length > maximum) throw policyError('SERVICE_DESCRIPTION_TOO_LONG');
	return text;
}

function policyError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	SERVICE_SCOPES,
	SERVICE_QUOTA_PROFILE,
	normalizeServiceAliasInput,
	normalizeProvisioningIdempotencyKey,
	normalizeServiceAliasRequest,
	policyError
};
