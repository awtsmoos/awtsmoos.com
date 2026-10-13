//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveQuotaPolicy
 * @description
 * The Awtsmoos places measured gevurah around each generous vessel. Awtsmoos.com
 * reckons Drive storage in the Talmudic coin system: every amount is perutas,
 * spoken in proper coins (pundyon, me'ah, dinar, shekel, maneh).
 *
 * Storage is priced Hetzner-like at 1 issar (8 perutas) per GB per month.
 * Every account receives a free monthly grant of 1 pundyon (16 perutas),
 * enough to carry the Chinam tier. Higher tiers are bought with perutas.
 * Admins carry no measure at all.
 */

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;
const TIB = 1024 * GIB;
const SOFT_WARNING_RATIO = 0.8;

/** 1 issar (8 perutas) per GB per month — the Hetzner-like storage rate. */
const STORAGE_RATE_PERUTAS_PER_GB = 8;

/** Free monthly grant: 1 pundyon = 16 perutas. */
const MONTHLY_GRANT_PERUTAS = 16;

/**
 * Talmudic storage tiers. Price is per month in perutas; byte quotas follow.
 * Chinam is free and fully covered by the monthly grant.
 */
const TALMUDIC_TIERS = Object.freeze({
	chinam: {
		code: 'chinam', name: 'Chinam', english: 'Free',
		monthlyPricePerutas: 0,
		priceLabel: 'free',
		quota: {
			storageBytes: 2 * GIB,
			singleFileBytes: 64 * MIB,
			fileCount: 10000,
			monthlyIngressBytes: GIB,
			monthlyEgressBytes: GIB,
			monthlyRequests: 250000,
			uploadRequestsPerMinute: 60,
			requestsPerMinute: 600,
			concurrentTransfers: 4
		}
	},
	tomech: {
		code: 'tomech', name: 'Tomech', english: 'Supporter',
		monthlyPricePerutas: 32,
		priceLabel: "1 me'ah / month",
		quota: {
			storageBytes: 10 * GIB,
			singleFileBytes: 256 * MIB,
			fileCount: 50000,
			monthlyIngressBytes: 10 * GIB,
			monthlyEgressBytes: 10 * GIB,
			monthlyRequests: 1000000,
			uploadRequestsPerMinute: 120,
			requestsPerMinute: 1200,
			concurrentTransfers: 8
		}
	},
	boneh: {
		code: 'boneh', name: 'Boneh', english: 'Builder',
		monthlyPricePerutas: 192,
		priceLabel: '1 dinar / month',
		quota: {
			storageBytes: 50 * GIB,
			singleFileBytes: 512 * MIB,
			fileCount: 200000,
			monthlyIngressBytes: 50 * GIB,
			monthlyEgressBytes: 50 * GIB,
			monthlyRequests: 5000000,
			uploadRequestsPerMinute: 240,
			requestsPerMinute: 2400,
			concurrentTransfers: 16
		}
	},
	gibbor: {
		code: 'gibbor', name: 'Gibbor', english: 'Mighty',
		monthlyPricePerutas: 768,
		priceLabel: '1 shekel / month',
		quota: {
			storageBytes: 250 * GIB,
			singleFileBytes: 2 * GIB,
			fileCount: 1000000,
			monthlyIngressBytes: 250 * GIB,
			monthlyEgressBytes: 512 * GIB,
			monthlyRequests: 25000000,
			uploadRequestsPerMinute: 600,
			requestsPerMinute: 6000,
			concurrentTransfers: 32
		}
	},
	nasi: {
		code: 'nasi', name: 'Nasi', english: 'Prince',
		monthlyPricePerutas: 19200,
		priceLabel: '1 maneh / month',
		quota: {
			storageBytes: 2 * TIB,
			singleFileBytes: 16 * GIB,
			fileCount: 10000000,
			monthlyIngressBytes: 2 * TIB,
			monthlyEgressBytes: 4 * TIB,
			monthlyRequests: 250000000,
			uploadRequestsPerMinute: 1200,
			requestsPerMinute: 12000,
			concurrentTransfers: 64
		}
	}
});

const TIER_ORDER = ['chinam', 'tomech', 'boneh', 'gibbor', 'nasi'];

/* Backward-compatible byte quotas: Chinam is the default vessel. */
const DEFAULT_QUOTA = Object.freeze({ ...TALMUDIC_TIERS.chinam.quota });
const SERVICE_QUOTA = Object.freeze({ ...TALMUDIC_TIERS.boneh.quota });
const PUBLIC_SITE_QUOTA = Object.freeze({
	...TALMUDIC_TIERS.boneh.quota,
	monthlyEgressBytes: 128 * GIB
});

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

/**
 * Drive-local peruta purse. Kept in the drive state so storage coin
 * never tangles with the compute-tier balance system.
 * state.perutaPurse = { balance, tier, tierSince, lastGrantMonth, ledger: [] }
 */
function purseFor(state) {
	state.perutaPurse = state.perutaPurse || {
		balance: 0,
		tier: 'chinam',
		tierSince: null,
		lastGrantMonth: '',
		ledger: []
	};
	return state.perutaPurse;
}

function currentMonthKey(at = Date.now()) {
	return new Date(at).toISOString().slice(0, 7);
}

function purseLedger(purse, entry) {
	purse.ledger = purse.ledger || [];
	purse.ledger.push({ at: Date.now(), ...entry });
	while (purse.ledger.length > 500) purse.ledger.shift();
}

/** Grant the free monthly pundyon. Idempotent within a calendar month. */
function grantMonthly(state, at = Date.now()) {
	const purse = purseFor(state);
	const month = currentMonthKey(at);
	if (purse.lastGrantMonth === month) {
		return { granted: 0, balance: purse.balance, month };
	}
	purse.balance += MONTHLY_GRANT_PERUTAS;
	purse.lastGrantMonth = month;
	purseLedger(purse, {
		kind: 'monthly_grant',
		deltaPerutas: MONTHLY_GRANT_PERUTAS,
		balance: purse.balance,
		note: '1 pundyon — the free monthly measure'
	});
	return { granted: MONTHLY_GRANT_PERUTAS, balance: purse.balance, month };
}

/** Subscribe (or renew) a tier, debiting the purse. */
function subscribeTier(state, tierCode) {
	const tier = tierDefinition(tierCode);
	const purse = purseFor(state);
	grantMonthly(state);
	if (purse.balance < tier.monthlyPricePerutas) {
		const error = quotaError('INSUFFICIENT_PERUTAS_FOR_TIER');
		error.needed = tier.monthlyPricePerutas;
		error.balance = purse.balance;
		error.tier = tier.code;
		throw error;
	}
	purse.balance -= tier.monthlyPricePerutas;
	purse.tier = tier.code;
	purse.tierSince = Date.now();
	purseLedger(purse, {
		kind: 'tier_subscription',
		tier: tier.code,
		deltaPerutas: -tier.monthlyPricePerutas,
		balance: purse.balance,
		note: `${tier.priceLabel} — ${tier.name} (${tier.english})`
	});
	state.quota = { ...tier.quota };
	return { tier: tier.code, balance: purse.balance, quota: state.quota };
}

/** Credit perutas to the purse (admin grant, purchase, earnings). */
function creditPurse(state, perutas, meta = {}) {
	const purse = purseFor(state);
	const n = Math.floor(Number(perutas) || 0);
	if (n <= 0) throw quotaError(`INVALID_PERUTA_CREDIT:${perutas}`);
	purse.balance += n;
	purseLedger(purse, {
		kind: meta.kind || 'credit',
		deltaPerutas: n,
		balance: purse.balance,
		note: meta.note || ''
	});
	return { balance: purse.balance };
}

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

function quotaError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

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
