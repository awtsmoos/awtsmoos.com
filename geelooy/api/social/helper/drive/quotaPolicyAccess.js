//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicyAccess
 * @description
 * Tier lookup, storage cost and quota merging helpers.
 */

const { quotaError, STORAGE_RATE_PERUTAS_PER_GB, GIB } = require('./quotaPolicyCore.js');
const { TALMUDIC_TIERS, DEFAULT_QUOTA } = require('./quotaPolicyTiers.js');

function tierDefinition(code) {
	const t = TALMUDIC_TIERS[String(code || '').toLowerCase()];
	if (!t) throw quotaError(`UNKNOWN_DRIVE_TIER:${code}`);
	return t;
}

function tierQuota(code) {
	return { ...tierDefinition(code).quota };
}

/** Peruta cost to hold `bytes` of storage for one month at the issar/GB rate. */
function storageCostPerutas(bytes) {
	const gb = Math.ceil(Number(bytes || 0) / GIB);
	return gb * STORAGE_RATE_PERUTAS_PER_GB;
}

/** Admins carry no measure: unlimited quota. */
function unlimitedQuota() {
	return {
		storageBytes: Number.MAX_SAFE_INTEGER,
		singleFileBytes: Number.MAX_SAFE_INTEGER,
		fileCount: Number.MAX_SAFE_INTEGER,
		monthlyIngressBytes: Number.MAX_SAFE_INTEGER,
		monthlyEgressBytes: Number.MAX_SAFE_INTEGER,
		monthlyRequests: Number.MAX_SAFE_INTEGER,
		uploadRequestsPerMinute: Number.MAX_SAFE_INTEGER,
		requestsPerMinute: Number.MAX_SAFE_INTEGER,
		concurrentTransfers: Number.MAX_SAFE_INTEGER,
		unlimited: true
	};
}

function isUnlimitedQuota(quota) {
	return Boolean(quota && quota.unlimited === true);
}

function mergedQuota(value = {}) {
	if (isUnlimitedQuota(value)) return unlimitedQuota();
	const quota = {};
	for (const [key, fallback] of Object.entries(DEFAULT_QUOTA)) {
		const candidate = Number(value[key]);
		quota[key] = Number.isSafeInteger(candidate) && candidate >= 0
			? candidate
			: fallback;
	}
	return quota;
}

module.exports = {
	tierDefinition,
	tierQuota,
	storageCostPerutas,
	unlimitedQuota,
	isUnlimitedQuota,
	mergedQuota
};
