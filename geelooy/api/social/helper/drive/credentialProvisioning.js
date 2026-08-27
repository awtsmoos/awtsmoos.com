//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCredentialProvisioning
 * @description
 * The Awtsmoos reveals one scoped token once and remembers only its proof.
 * Awtsmoos.com binds duplicate requests to one credential without secret replay.
 */

const { createCredentialSecret } = require('./credentialCrypto.js');
const {
	MAX_ACTIVE_CREDENTIALS,
	MAX_IDEMPOTENCY_RECORDS,
	normalizeScopes,
	normalizeCredentialName,
	normalizeIdempotencyKey,
	requestFingerprint,
	credentialPolicyError
} = require('./credentialPolicy.js');
const { mutateDriveState, readDriveState } = require('./stateRepository.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function provisionDriveCredential(options) {
	const name = normalizeCredentialName(options.name);
	const scopes = normalizeScopes(options.scopes);
	const idempotencyId = normalizeIdempotencyKey(options.idempotencyKey);
	const fingerprint = requestFingerprint(options.ownerUserId, name, scopes);
	const secret = await createCredentialSecret();
	return mutateDriveState(options.aliasId, options.$i, state => {
		const previous = state.idempotencyRecords[idempotencyId];
		if (previous) return replayProvisioning(state, previous, fingerprint);
		const active = Object.values(state.serviceCredentials)
			.filter(credential => !credential.revokedAt).length;
		if (active >= MAX_ACTIVE_CREDENTIALS) {
			throw credentialPolicyError('CREDENTIAL_LIMIT_REACHED');
		}
		const now = new Date().toISOString();
		const credential = {
			id: secret.credentialId,
			name,
			scopes,
			ownerUserId: String(options.ownerUserId),
			secretHash: secret.secretHash,
			secretSalt: secret.salt,
			createdAt: now,
			lastUsedAt: null,
			revokedAt: null
		};
		state.serviceCredentials[credential.id] = credential;
		state.idempotencyRecords[idempotencyId] = {
			fingerprint,
			credentialId: credential.id,
			createdAt: now
		};
		pruneIdempotency(state);
		recordDriveEvent(state, {
			type: 'credential.create',
			actorUserId: options.ownerUserId,
			credentialId: credential.id,
			requestId: options.requestId
		});
		return { credential: publicCredential(credential), token: secret.token, replayed: false };
	});
}

async function listDriveCredentials(aliasId, $i = {}) {
	const state = await readDriveState(aliasId, $i);
	return Object.values(state.serviceCredentials).map(publicCredential);
}

async function revokeDriveCredential(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const credential = state.serviceCredentials[options.credentialId];
		if (!credential) throw credentialPolicyError('CREDENTIAL_NOT_FOUND');
		credential.revokedAt = credential.revokedAt || new Date().toISOString();
		recordDriveEvent(state, {
			type: 'credential.revoke',
			actorUserId: options.ownerUserId,
			credentialId: credential.id,
			requestId: options.requestId
		});
		return { credential: publicCredential(credential) };
	});
}

function replayProvisioning(state, previous, fingerprint) {
	if (previous.fingerprint !== fingerprint) {
		const error = credentialPolicyError('IDEMPOTENCY_CONFLICT');
		error.statusCode = 409;
		throw error;
	}
	const credential = state.serviceCredentials[previous.credentialId];
	if (!credential) throw credentialPolicyError('IDEMPOTENCY_RECORD_STALE');
	return { credential: publicCredential(credential), token: null, replayed: true };
}

function publicCredential(credential) {
	return {
		id: credential.id,
		name: credential.name,
		scopes: credential.scopes,
		ownerUserId: credential.ownerUserId,
		createdAt: credential.createdAt,
		lastUsedAt: credential.lastUsedAt,
		revokedAt: credential.revokedAt
	};
}

function pruneIdempotency(state) {
	const records = Object.entries(state.idempotencyRecords);
	if (records.length <= MAX_IDEMPOTENCY_RECORDS) return;
	records.sort((left, right) => String(left[1].createdAt).localeCompare(String(right[1].createdAt)));
	for (const [key] of records.slice(0, records.length - MAX_IDEMPOTENCY_RECORDS)) {
		delete state.idempotencyRecords[key];
	}
}

module.exports = {
	provisionDriveCredential,
	listDriveCredentials,
	revokeDriveCredential,
	publicCredential
};
