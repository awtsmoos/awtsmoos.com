//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveQuotaAdministration
 * @description
 * The Awtsmoos expands a vessel only through explicit entrusted authority.
 * Awtsmoos.com audits profiles and refuses limits below committed obligations.
 */

const {
	DEFAULT_QUOTA,
	PUBLIC_SITE_QUOTA,
	SERVICE_QUOTA,
	mergedQuota,
	quotaError
} = require('./quotaPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { recordDriveEvent } = require('./auditEvents.js');

const QUOTA_PROFILES = Object.freeze({
	default: DEFAULT_QUOTA,
	'public-site': PUBLIC_SITE_QUOTA,
	'service-migration': SERVICE_QUOTA
});

async function assignDriveQuota(options) {
	const profile = String(options.profile || 'custom');
	const quota = profile === 'custom'
		? mergedQuota(options.quota)
		: quotaForProfile(profile);
	return mutateDriveState(options.aliasId, options.$i, state => {
		assertQuotaContainsUsage(state, quota);
		state.quotaProfile = profile;
		state.quota = { ...quota };
		const event = recordDriveEvent(state, {
			type: 'quota.assign',
			actorUserId: options.adminUserId,
			bytes: quota.storageBytes,
			requestId: options.requestId
		});
		return {
			quotaProfile: profile,
			quota: state.quota,
			usage: state.usage,
			event
		};
	});
}

function quotaForProfile(profile) {
	const quota = QUOTA_PROFILES[profile];
	if (!quota) throw quotaError('QUOTA_PROFILE_INVALID');
	return { ...quota };
}

function assertQuotaContainsUsage(state, quota) {
	if (state.usage.storedBytes > quota.storageBytes) {
		throw quotaError('QUOTA_BELOW_STORED_BYTES');
	}
	if (state.usage.fileCount > quota.fileCount) {
		throw quotaError('QUOTA_BELOW_FILE_COUNT');
	}
	if (largestCommittedFile(state) > quota.singleFileBytes) {
		throw quotaError('QUOTA_BELOW_SINGLE_FILE');
	}
	if (Object.keys(state.transferLeases || {}).length > quota.concurrentTransfers) {
		throw quotaError('QUOTA_BELOW_ACTIVE_TRANSFERS');
	}
	for (const month of Object.values(state.usage.monthly || {})) {
		assertMonthFitsQuota(month, quota);
	}
}

function assertMonthFitsQuota(month, quota) {
	if (Number(month.ingressBytes || 0) > quota.monthlyIngressBytes) {
		throw quotaError('QUOTA_BELOW_MONTHLY_INGRESS');
	}
	if (Number(month.egressBytes || 0) > quota.monthlyEgressBytes) {
		throw quotaError('QUOTA_BELOW_MONTHLY_EGRESS');
	}
	if (Number(month.requests || 0) > quota.monthlyRequests) {
		throw quotaError('QUOTA_BELOW_MONTHLY_REQUESTS');
	}
}

function largestCommittedFile(state) {
	return Object.values(state.entries || {}).reduce((largest, entry) => {
		if (entry.type !== 'file') return largest;
		return Math.max(largest, Number(entry.size || 0));
	}, 0);
}

module.exports = {
	QUOTA_PROFILES,
	assignDriveQuota,
	assertQuotaContainsUsage,
	largestCommittedFile,
	quotaForProfile
};
