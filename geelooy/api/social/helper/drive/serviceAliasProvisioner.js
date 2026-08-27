//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceAliasProvisioner
 * @description
 * The Awtsmoos clothes one existing human identity in a bounded service alias.
 * Awtsmoos.com creates no parallel user kingdom: ownership, quota, credential,
 * and idempotency remain inside the canonical social and drive repositories.
 */

const { verifyAliasOwnership } = require('../alias.js');
const { NativeAliasGateway } = require('./nativeAliasGateway.js');
const { readDriveState } = require('./stateRepository.js');
const {
	assignDriveQuota,
	quotaForProfile
} = require('./quotaAdministration.js');
const {
	provisionDriveCredential
} = require('./credentialProvisioning.js');
const {
	SERVICE_SCOPES,
	SERVICE_QUOTA_PROFILE,
	normalizeServiceAliasInput,
	normalizeProvisioningIdempotencyKey
} = require('./serviceAliasPolicy.js');
const {
	withServiceProvisioningLock
} = require('./serviceProvisioningLock.js');

class ServiceAliasProvisioner {
	constructor(dependencies = {}) {
		this.aliasGateway = dependencies.aliasGateway || new NativeAliasGateway();
		this.verifyOwnership = dependencies.verifyOwnership || verifyAliasOwnership;
		this.readState = dependencies.readState || readDriveState;
		this.assignQuota = dependencies.assignQuota || assignDriveQuota;
		this.provisionCredential = dependencies.provisionCredential || provisionDriveCredential;
		this.withLock = dependencies.withLock || withServiceProvisioningLock;
	}

	async provision(options) {
		const alias = normalizeServiceAliasInput(options);
		const idempotencyKey = normalizeProvisioningIdempotencyKey(options.idempotencyKey);
		return this.withLock(alias.aliasId, options.$i, async () => {
			const created = await this.ensureOwnedAlias(alias, options);
			const quota = await this.ensureServiceQuota(alias.aliasId, options);
			const credential = await this.provisionCredential({
				aliasId: alias.aliasId,
				ownerUserId: options.adminUserId,
				name: `${alias.aliasName} migration agent`,
				scopes: SERVICE_SCOPES,
				idempotencyKey,
				requestId: options.requestId,
				$i: options.$i
			});
			return { alias: { ...alias, created }, quota, credential };
		});
	}

	async ensureOwnedAlias(alias, options) {
		const owned = await this.verifyOwnership(alias.aliasId, options.$i, options.adminUserId);
		if (owned) return false;
		await this.aliasGateway.createOwnedAlias({
			...alias,
			userid: options.adminUserId,
			$i: options.$i
		});
		const verified = await this.verifyOwnership(alias.aliasId, options.$i, options.adminUserId);
		if (!verified) throw provisioningError('SERVICE_ALIAS_OWNERSHIP_NOT_ESTABLISHED');
		return true;
	}

	async ensureServiceQuota(aliasId, options) {
		const expected = quotaForProfile(SERVICE_QUOTA_PROFILE);
		const state = await this.readState(aliasId, options.$i);
		if (state.quotaProfile === SERVICE_QUOTA_PROFILE && quotasEqual(state.quota, expected)) {
			return { quotaProfile: SERVICE_QUOTA_PROFILE, quota: state.quota, unchanged: true };
		}
		return this.assignQuota({
			aliasId,
			adminUserId: options.adminUserId,
			profile: SERVICE_QUOTA_PROFILE,
			requestId: options.requestId,
			$i: options.$i
		});
	}
}

function quotasEqual(left, right) {
	return Object.keys(right).every(key => Number(left?.[key]) === Number(right[key]));
}

function provisioningError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	ServiceAliasProvisioner,
	quotasEqual,
	provisioningError
};
