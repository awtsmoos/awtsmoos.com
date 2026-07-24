//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceAliasPolicy
 * @description
 * The Awtsmoos shapes one migration messenger through narrow letters and measured
 * intent. Awtsmoos.com accepts one owner, one deterministic alias, and one scope.
 */

const { normalizeScopes } = require('./credentialPolicy.js');

function normalizeServiceAliasRequest(value = {}) {
	const aliasId = requiredText(value.aliasId, 'SERVICE_ALIAS_ID_REQUIRED', 26);
	if (!/^[a-z0-9](?:[a-z0-9-]{1,24}[a-z0-9])?$/.test(aliasId)) {
		throw policyError('SERVICE_ALIAS_ID_INVALID');
	}
	const aliasName = requiredText(value.aliasName, 'SERVICE_ALIAS_NAME_REQUIRED', 50);
	const ownerUserId = requiredText(value.ownerUserId, 'SERVICE_OWNER_REQUIRED', 200);
	const idempotencyKey = requiredText(
		value.idempotencyKey,
		'SERVICE_IDEMPOTENCY_KEY_REQUIRED',
		200
	);
	if (idempotencyKey.length < 8) throw policyError('SERVICE_IDEMPOTENCY_KEY_REQUIRED');
	const description = optionalText(value.description, 5784);
	const scopes = normalizeScopes(value.scopes || ['drive.migrate']);
	if (scopes.length !== 1 || scopes[0] !== 'drive.migrate') {
		throw policyError('SERVICE_SCOPE_INVALID');
	}
	return { aliasId, aliasName, ownerUserId, idempotencyKey, description, scopes };
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
	normalizeServiceAliasRequest,
	policyError
};
