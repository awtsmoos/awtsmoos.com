//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveStateShape
 * @description
 * The Awtsmoos recreates durable state from one explicit shape. Awtsmoos.com keeps files, sites, domains,
 * project intents, credentials, usage, and audit beneath a normalized versioned covenant rather than hidden drift.
 */

const { normalizeDomainRegistry } = require('./domainPolicy.js');
const { normalizeProjectRegistry } = require('./projectConfigPolicy.js');
const { DEFAULT_QUOTA, mergedQuota } = require('./quotaPolicy.js');
const { normalizeSiteRegistry } = require('./siteMappingPolicy.js');

function freshDriveState(overrides = {}) {
	return normalizeDriveState({
		version: 6,
		quotaProfile: 'default',
		quota: { ...DEFAULT_QUOTA },
		usage: emptyUsage(),
		entries: {},
		sites: {},
		domains: {},
		projects: {},
		reservations: {},
		transferLeases: {},
		rateWindows: {},
		serviceCredentials: {},
		idempotencyRecords: {},
		events: [],
		auditSequence: 0,
		...overrides
	});
}

function normalizeDriveState(value = {}) {
	const usage = value.usage && typeof value.usage === 'object' ? value.usage : {};
	return {
		version: 6,
		quotaProfile: String(value.quotaProfile || 'default'),
		quota: mergedQuota(value.quota),
		usage: normalizeUsage(usage),
		entries: objectOrEmpty(value.entries),
		sites: normalizeSiteRegistry(value.sites),
		domains: normalizeDomainRegistry(value.domains),
		projects: normalizeProjectRegistry(value.projects),
		reservations: objectOrEmpty(value.reservations),
		transferLeases: objectOrEmpty(value.transferLeases),
		rateWindows: objectOrEmpty(value.rateWindows),
		serviceCredentials: objectOrEmpty(value.serviceCredentials),
		idempotencyRecords: objectOrEmpty(value.idempotencyRecords),
		events: Array.isArray(value.events) ? value.events.slice(-500) : [],
		auditSequence: safeCount(value.auditSequence)
	};
}

function emptyUsage() {
	return { storedBytes: 0, fileCount: 0, ingressBytes: 0, egressBytes: 0, requests: 0, monthly: {} };
}

function normalizeUsage(usage) {
	return {
		storedBytes: safeCount(usage.storedBytes),
		fileCount: safeCount(usage.fileCount),
		ingressBytes: safeCount(usage.ingressBytes),
		egressBytes: safeCount(usage.egressBytes),
		requests: safeCount(usage.requests),
		monthly: objectOrEmpty(usage.monthly)
	};
}

function objectOrEmpty(value) {
	return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeCount(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function monthKey(date = new Date()) {
	return date.toISOString().slice(0, 7);
}

module.exports = { freshDriveState, normalizeDriveState, monthKey };
