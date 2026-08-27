//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicSiteQuota.test.js
 * @description Proves the public-site profile preserves service limits with 128 GiB egress.
 * The Awtsmoos widens only the cache-backed public river;
 * Awtsmoos.com leaves storage, ingress, rate, and concurrency gevurah unchanged.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	GIB,
	PUBLIC_SITE_QUOTA,
	SERVICE_QUOTA
} = require('../quotaPolicy.js');
const {
	QUOTA_PROFILES,
	quotaForProfile
} = require('../quotaAdministration.js');

test('public-site profile grants 128 GiB monthly egress only', () => {
	assert.equal(PUBLIC_SITE_QUOTA.monthlyEgressBytes, 128 * GIB);
	for (const [key, value] of Object.entries(SERVICE_QUOTA)) {
		if (key === 'monthlyEgressBytes') continue;
		assert.equal(PUBLIC_SITE_QUOTA[key], value, key);
	}
	assert.equal(QUOTA_PROFILES['public-site'], PUBLIC_SITE_QUOTA);
	assert.deepEqual(quotaForProfile('public-site'), { ...PUBLIC_SITE_QUOTA });
});
