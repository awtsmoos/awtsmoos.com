//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module usageServiceApi
 * @description
 * Drive request accounting: begin, finish, abort, public transfer, ingress and usage reads.
 */

const crypto = require('crypto');
const { mutateDriveState, readDriveState } = require('./stateRepository.js');
const { monthKey } = require('./stateShape.js');
const { mergedQuota, quotaWarnings, quotaError } = require('./quotaPolicy.js');

const { createTransferLease, currentRateWindow, currentMonthUsage, pruneTrafficState, safeBytes } = require('./usageServiceHelpers.js');

async function beginDriveRequest(aliasId, options = {}, $i = {}) {
	return mutateDriveState(aliasId, $i, state => {
		pruneTrafficState(state);
		const quota = mergedQuota(state.quota);
		const window = currentRateWindow(state);
		if (window.requests + 1 > quota.requestsPerMinute) {
			throw quotaError('REQUEST_RATE_EXCEEDED');
		}
		if (options.upload && window.uploads + 1 > quota.uploadRequestsPerMinute) {
			throw quotaError('UPLOAD_RATE_EXCEEDED');
		}
		const month = currentMonthUsage(state);
		const ingressBytes = safeBytes(options.ingressBytes);
		if (month.requests + 1 > quota.monthlyRequests) {
			throw quotaError('MONTHLY_REQUEST_QUOTA_EXCEEDED');
		}
		if (month.ingressBytes + ingressBytes > quota.monthlyIngressBytes) {
			throw quotaError('MONTHLY_INGRESS_QUOTA_EXCEEDED');
		}
		const leaseId = options.transfer ? createTransferLease(state, quota, options.kind) : null;
		window.requests += 1;
		if (options.upload) window.uploads += 1;
		month.requests += 1;
		month.ingressBytes += ingressBytes;
		state.usage.requests += 1;
		state.usage.ingressBytes += ingressBytes;
		return { leaseId, quota, month, warnings: quotaWarnings(state) };
	});
}

async function finishDriveRequest(aliasId, leaseId, egressBytes = 0, $i = {}) {
	const result = await mutateDriveState(aliasId, $i, state => {
		if (leaseId) delete state.transferLeases[leaseId];
		const quota = mergedQuota(state.quota);
		const month = currentMonthUsage(state);
		const bytes = safeBytes(egressBytes);
		if (month.egressBytes + bytes > quota.monthlyEgressBytes) {
			return { denied: 'MONTHLY_EGRESS_QUOTA_EXCEEDED' };
		}
		month.egressBytes += bytes;
		state.usage.egressBytes += bytes;
		return { denied: null, month, usage: state.usage, warnings: quotaWarnings(state) };
	});
	if (result.denied) throw quotaError(result.denied);
	return result;
}

async function abortDriveRequest(aliasId, leaseId, $i = {}) {
	if (!leaseId) return;
	await mutateDriveState(aliasId, $i, state => {
		delete state.transferLeases[leaseId];
	});
}

async function accountPublicTransfer(aliasId, responseBytes, $i = {}) {
	await beginDriveRequest(aliasId, {}, $i);
	return finishDriveRequest(aliasId, null, responseBytes, $i);
}

async function accountIngress(aliasId, ingressBytes, $i = {}) {
	return beginDriveRequest(aliasId, { ingressBytes, upload: true }, $i);
}

async function getDriveUsage(aliasId, $i = {}) {
	const state = await readDriveState(aliasId, $i);
	pruneTrafficState(state);
	return {
		usage: state.usage,
		quota: mergedQuota(state.quota),
		warnings: quotaWarnings(state),
		reservations: Object.values(state.reservations || {}).length,
		activeTransfers: Object.values(state.transferLeases || {}).length
	};
}

module.exports = {
	beginDriveRequest,
	finishDriveRequest,
	abortDriveRequest,
	accountPublicTransfer,
	accountIngress,
	getDriveUsage
};
