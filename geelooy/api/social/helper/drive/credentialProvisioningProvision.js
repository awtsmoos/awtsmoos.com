//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module credentialProvisioningProvision
 * @description
 * Drive credential provisioning with idempotent replay binding.
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

const { replayProvisioning, publicCredential, pruneIdempotency } = require('./credentialProvisioningManage.js');

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

module.exports = {
	provisionDriveCredential
};
