//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceAliasProvisioning
 * @description
 * The Awtsmoos orders identity, capacity, and secret revelation without confusion.
 * Awtsmoos.com makes every stage replayable while revealing the token only once.
 */

const { normalizeServiceAliasRequest } = require('./serviceAliasPolicy.js');
const { ensureNativeServiceAlias } = require('./nativeAliasGateway.js');
const { assignDriveQuota } = require('./quotaAdministration.js');
const { provisionDriveCredential } = require('./credentialProvisioning.js');

async function provisionDriveServiceAlias(options, dependencies = {}) {
	const request = normalizeServiceAliasRequest(options);
	const ensureAlias = dependencies.ensureAlias || ensureNativeServiceAlias;
	const assignQuota = dependencies.assignQuota || assignDriveQuota;
	const provisionCredential = dependencies.provisionCredential
		|| provisionDriveCredential;
	const alias = await ensureAlias({ ...request, $i: options.$i }, dependencies);
	const quota = await assignQuota({
		aliasId: request.aliasId,
		adminUserId: options.adminUserId,
		profile: 'service-migration',
		requestId: options.requestId,
		$i: options.$i
	});
	const credential = await provisionCredential({
		aliasId: request.aliasId,
		ownerUserId: request.ownerUserId,
		name: `${request.aliasName} migration`,
		scopes: request.scopes,
		idempotencyKey: request.idempotencyKey,
		requestId: options.requestId,
		$i: options.$i
	});
	return {
		alias,
		quotaProfile: quota.quotaProfile,
		quota: quota.quota,
		credential
	};
}

module.exports = {
	provisionDriveServiceAlias
};
