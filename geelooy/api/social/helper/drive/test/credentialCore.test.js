//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file credentialCore.test.js
 * @description
 * The Awtsmoos tests one-time secrets, duplicate safety, scope boundaries, alias
 * isolation, and revocation. Awtsmoos.com keeps no recoverable token in state.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const {
	provisionDriveCredential,
	revokeDriveCredential
} = require('../credentialProvisioning.js');
const { verifyDriveCredential } = require('../credentialVerification.js');
const { readDriveState } = require('../stateRepository.js');

async function provision($i, overrides = {}) {
	return provisionDriveCredential({
		aliasId: 'alpha',
		ownerUserId: 'owner-1',
		name: 'Migration messenger',
		scopes: ['drive.read', 'drive.write'],
		idempotencyKey: 'migration-request-0001',
		$i,
		...overrides
	});
}

function bearer(token) {
	return { authorization: `Bearer ${token}` };
}

test('returns a secret once and stores only a salted proof', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-credential-');
	const created = await provision($i);
	assert.match(created.token, /^awts_drive_[a-f0-9]{24}\./);
	assert.equal(created.replayed, false);
	assert.equal(created.credential.secretHash, undefined);
	assert.equal(created.credential.secretSalt, undefined);
	const state = await readDriveState('alpha', $i);
	const stored = state.serviceCredentials[created.credential.id];
	assert.ok(stored.secretHash);
	assert.ok(stored.secretSalt);
	assert.equal(JSON.stringify(state).includes(created.token), false);
});

test('replays idempotently without revealing or duplicating the token', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-idempotent-');
	const first = await provision($i);
	const replay = await provision($i);
	assert.equal(replay.credential.id, first.credential.id);
	assert.equal(replay.token, null);
	assert.equal(replay.replayed, true);
	const state = await readDriveState('alpha', $i);
	assert.equal(Object.keys(state.serviceCredentials).length, 1);
	await assert.rejects(
		provision($i, { name: 'Changed request' }),
		error => error.code === 'IDEMPOTENCY_CONFLICT' && error.statusCode === 409
	);
});

test('binds credentials to one alias and every required scope', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-scopes-');
	const created = await provision($i);
	const actor = await verifyDriveCredential({
		aliasId: 'alpha',
		requiredScope: ['drive.read', 'drive.write'],
		headers: bearer(created.token),
		$i
	});
	assert.equal(actor.aliasId, 'alpha');
	assert.equal(actor.credentialId, created.credential.id);
	await assert.rejects(
		verifyDriveCredential({
			aliasId: 'alpha',
			requiredScope: 'drive.delete',
			headers: bearer(created.token),
			$i
		}),
		error => error.code === 'CREDENTIAL_SCOPE_REQUIRED' && error.statusCode === 403
	);
	await assert.rejects(
		verifyDriveCredential({
			aliasId: 'beta',
			requiredScope: 'drive.read',
			headers: bearer(created.token),
			$i
		}),
		error => error.code === 'CREDENTIAL_INVALID' && error.statusCode === 401
	);
});

test('revocation invalidates an otherwise valid token', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-revoke-');
	const created = await provision($i);
	await revokeDriveCredential({
		aliasId: 'alpha',
		credentialId: created.credential.id,
		ownerUserId: 'owner-1',
		$i
	});
	await assert.rejects(
		verifyDriveCredential({
			aliasId: 'alpha',
			requiredScope: 'drive.read',
			headers: bearer(created.token),
			$i
		}),
		error => error.code === 'CREDENTIAL_INVALID'
	);
});
