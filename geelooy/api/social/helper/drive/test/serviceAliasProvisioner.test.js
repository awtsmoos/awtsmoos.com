//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file serviceAliasProvisioner.test.js
 * @description
 * The Awtsmoos tests service identity as a measured garment of existing ownership.
 * Awtsmoos.com proves creation, quota, scope, replay, and failure remain bounded.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	ServiceAliasProvisioner
} = require('../serviceAliasProvisioner.js');
const {
	quotaForProfile
} = require('../quotaAdministration.js');

function baseOptions() {
	return {
		aliasId: 'migration_service',
		aliasName: 'Migration Service',
		description: 'Imports legacy Firebase assets.',
		idempotencyKey: 'migration-service-request-1',
		adminUserId: 'admin-1',
		requestId: 'request-1',
		$i: { db: { directory: '/tmp/awtsmoos-provisioner-test' } }
	};
}

function unlocked(aliasId, $i, action) {
	assert.equal(aliasId, 'migration_service');
	assert.ok($i.db.directory);
	return action();
}

test('creates an owned alias, assigns service quota, and mints migration scope', async () => {
	const calls = { create: 0, quota: 0, credential: 0 };
	const ownership = [false, true];
	const provisioner = new ServiceAliasProvisioner({
		aliasGateway: {
			async createOwnedAlias() {
				calls.create += 1;
			}
		},
		verifyOwnership: async () => ownership.shift(),
		readState: async () => ({ quotaProfile: 'default', quota: {} }),
		assignQuota: async options => {
			calls.quota += 1;
			assert.equal(options.profile, 'service-migration');
			return { quotaProfile: options.profile };
		},
		provisionCredential: async options => {
			calls.credential += 1;
			assert.deepEqual(options.scopes, ['drive.migrate']);
			return { credential: { id: 'credential-1' }, token: 'secret' };
		},
		withLock: unlocked
	});
	const result = await provisioner.provision(baseOptions());
	assert.equal(result.alias.created, true);
	assert.deepEqual(calls, { create: 1, quota: 1, credential: 1 });
	assert.equal(result.credential.token, 'secret');
});

test('reuses an owned alias and exact service quota on idempotent replay', async () => {
	let created = false;
	let assigned = false;
	const expectedQuota = quotaForProfile('service-migration');
	const provisioner = new ServiceAliasProvisioner({
		aliasGateway: {
			async createOwnedAlias() {
				created = true;
			}
		},
		verifyOwnership: async () => true,
		readState: async () => ({
			quotaProfile: 'service-migration',
			quota: expectedQuota
		}),
		assignQuota: async () => {
			assigned = true;
		},
		provisionCredential: async () => ({
			credential: { id: 'credential-1' },
			token: null,
			replayed: true
		}),
		withLock: unlocked
	});
	const result = await provisioner.provision(baseOptions());
	assert.equal(result.alias.created, false);
	assert.equal(result.quota.unchanged, true);
	assert.equal(result.credential.replayed, true);
	assert.equal(created, false);
	assert.equal(assigned, false);
});

test('refuses completion when native creation does not establish ownership', async () => {
	const provisioner = new ServiceAliasProvisioner({
		aliasGateway: { async createOwnedAlias() {} },
		verifyOwnership: async () => false,
		withLock: unlocked
	});
	await assert.rejects(
		provisioner.provision(baseOptions()),
		error => error.code === 'SERVICE_ALIAS_OWNERSHIP_NOT_ESTABLISHED'
	);
});
