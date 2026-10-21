//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module credentialProvisioningManage
 * @description
 * Drive credential listing, revocation, replay and idempotency pruning.
 */

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
	listDriveCredentials,
	revokeDriveCredential,
	replayProvisioning,
	publicCredential,
	pruneIdempotency
};
