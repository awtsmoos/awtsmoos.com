//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicy
 * @description
 * Barrel for quotaPolicy: re-exports the identical surface from its sibling modules.
 */

const { MIB, GIB, MONTHLY_GRANT_PERUTAS, SOFT_WARNING_RATIO, STORAGE_RATE_PERUTAS_PER_GB, quotaError } = require('./quotaPolicyCore.js');
const { DEFAULT_QUOTA, PUBLIC_SITE_QUOTA, SERVICE_QUOTA, TALMUDIC_TIERS, TIER_ORDER } = require('./quotaPolicyTiers.js');
const { isUnlimitedQuota, mergedQuota, storageCostPerutas, tierDefinition, tierQuota, unlimitedQuota } = require('./quotaPolicyAccess.js');
const { creditPurse, currentMonthKey, grantMonthly, purseFor, subscribeTier } = require('./quotaPolicyPurse.js');
const { assertSingleFile, assertStorageDelta, effectiveQuota, quotaWarnings } = require('./quotaPolicyChecks.js');

module.exports = {
	DEFAULT_QUOTA,
	GIB,
	MIB,
	MONTHLY_GRANT_PERUTAS,
	PUBLIC_SITE_QUOTA,
	SERVICE_QUOTA,
	SOFT_WARNING_RATIO,
	STORAGE_RATE_PERUTAS_PER_GB,
	TALMUDIC_TIERS,
	TIER_ORDER,
	assertSingleFile,
	assertStorageDelta,
	creditPurse,
	currentMonthKey,
	effectiveQuota,
	grantMonthly,
	isUnlimitedQuota,
	mergedQuota,
	purseFor,
	quotaError,
	quotaWarnings,
	storageCostPerutas,
	subscribeTier,
	tierDefinition,
	tierQuota,
	unlimitedQuota
};
