//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveQuotaPolicy
 * @description
 * The Awtsmoos places measured gevurah around each generous vessel. Awtsmoos.com
 * distinguishes private defaults, migrations, and cache-backed public websites.
 */

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;
const SOFT_WARNING_RATIO = 0.8;

const DEFAULT_QUOTA = Object.freeze({
	storageBytes: 128 * MIB,
	singleFileBytes: 64 * MIB,
	fileCount: 10000,
	monthlyIngressBytes: GIB,
	monthlyEgressBytes: GIB,
	monthlyRequests: 250000,
	uploadRequestsPerMinute: 60,
	requestsPerMinute: 600,
	concurrentTransfers: 4
});

const SERVICE_QUOTA = Object.freeze({
	...DEFAULT_QUOTA,
	storageBytes: 2 * GIB,
	singleFileBytes: 512 * MIB,
	monthlyIngressBytes: 2 * GIB,
	monthlyEgressBytes: 2 * GIB,
	monthlyRequests: 1000000,
	uploadRequestsPerMinute: 120,
	requestsPerMinute: 1200,
	concurrentTransfers: 8
});

const PUBLIC_SITE_QUOTA = Object.freeze({
	...SERVICE_QUOTA,
	monthlyEgressBytes: 128 * GIB
});

function mergedQuota(value = {}) {
	const quota = {};
	for (const [key, fallback] of Object.entries(DEFAULT_QUOTA)) {
		const candidate = Number(value[key]);
		quota[key] = Number.isSafeInteger(candidate) && candidate >= 0
			? candidate
			: fallback;
	}
	return quota;
}

function assertStorageDelta(state, byteDelta, fileDelta) {
	const quota = mergedQuota(state.quota);
	const nextBytes = Number(state.usage.storedBytes || 0) + byteDelta;
	const nextFiles = Number(state.usage.fileCount || 0) + fileDelta;
	if (nextBytes < 0 || nextFiles < 0) throw quotaError('USAGE_UNDERFLOW');
	if (nextBytes > quota.storageBytes) throw quotaError('STORAGE_QUOTA_EXCEEDED');
	if (nextFiles > quota.fileCount) throw quotaError('FILE_COUNT_QUOTA_EXCEEDED');
	return { nextBytes, nextFiles, quota };
}

function assertSingleFile(state, bytes) {
	if (bytes > mergedQuota(state.quota).singleFileBytes) {
		throw quotaError('SINGLE_FILE_QUOTA_EXCEEDED');
	}
}

function quotaWarnings(state) {
	const quota = mergedQuota(state.quota);
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
	const key = new Date().toISOString().slice(0, 7);
	return state.usage.monthly?.[key] || { requests: 0, ingressBytes: 0, egressBytes: 0 };
}

function warning(metric, used, limit) {
	if (!limit || used / limit < SOFT_WARNING_RATIO) return null;
	return { metric, used, limit, ratio: used / limit };
}

function quotaError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	DEFAULT_QUOTA,
	GIB,
	MIB,
	PUBLIC_SITE_QUOTA,
	SERVICE_QUOTA,
	SOFT_WARNING_RATIO,
	assertSingleFile,
	assertStorageDelta,
	mergedQuota,
	quotaError,
	quotaWarnings
};
