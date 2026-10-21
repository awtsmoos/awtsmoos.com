//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicyChecks
 * @description
 * Effective quota resolution, storage assertions and quota warnings.
 */

const { SOFT_WARNING_RATIO } = require('./quotaPolicyCore.js');
const { TALMUDIC_TIERS, TIER_ORDER } = require('./quotaPolicyTiers.js');
const { unlimitedQuota, isUnlimitedQuota, mergedQuota } = require('./quotaPolicyAccess.js');
const { purseFor, currentMonthKey } = require('./quotaPolicyPurse.js');

/** Resolve the effective quota: admin unlimited wins, else the subscribed tier. */
function effectiveQuota(state, { isAdmin = false } = {}) {
	if (isAdmin) return unlimitedQuota();
	const purse = purseFor(state);
	if (TIER_ORDER.includes(purse.tier)) {
		return { ...TALMUDIC_TIERS[purse.tier].quota };
	}
	return mergedQuota(state.quota);
}

function assertStorageDelta(state, byteDelta, fileDelta, options = {}) {
	const quota = options.isAdmin ? unlimitedQuota() : mergedQuota(state.quota);
	const nextBytes = Number(state.usage.storedBytes || 0) + byteDelta;
	const nextFiles = Number(state.usage.fileCount || 0) + fileDelta;
	if (nextBytes < 0 || nextFiles < 0) throw quotaError('USAGE_UNDERFLOW');
	if (nextBytes > quota.storageBytes) throw quotaError('STORAGE_QUOTA_EXCEEDED');
	if (nextFiles > quota.fileCount) throw quotaError('FILE_COUNT_QUOTA_EXCEEDED');
	return { nextBytes, nextFiles, quota };
}

function assertSingleFile(state, bytes, options = {}) {
	const quota = options.isAdmin ? unlimitedQuota() : mergedQuota(state.quota);
	if (bytes > quota.singleFileBytes) {
		throw quotaError('SINGLE_FILE_QUOTA_EXCEEDED');
	}
}

function quotaWarnings(state, options = {}) {
	const quota = options.isAdmin ? unlimitedQuota() : mergedQuota(state.quota);
	if (isUnlimitedQuota(quota)) return [];
	const month = currentMonth(state);
	return [
		warning('storageBytes', state.usage.storedBytes, quota.storageBytes),
		warning('fileCount', state.usage.fileCount, quota.fileCount),
		warning('monthlyIngressBytes', month.ingressBytes, quota.monthlyIngressBytes),
		warning('monthlyEgressBytes', month.egressBytes, quota.monthlyEgressBytes),
		warning('monthlyRequests', month.requests, quota.monthlyRequests)
	].filter(Boolean);
}

function currentMonth(state) {
	const key = currentMonthKey();
	return state.usage.monthly?.[key] || { requests: 0, ingressBytes: 0, egressBytes: 0 };
}

function warning(metric, used, limit) {
	if (!limit || used / limit < SOFT_WARNING_RATIO) return null;
	return { metric, used, limit, ratio: used / limit };
}

module.exports = {
	effectiveQuota,
	assertStorageDelta,
	assertSingleFile,
	quotaWarnings,
	currentMonth,
	warning
};
