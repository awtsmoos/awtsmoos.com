//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicyTiers
 * @description
 * Talmudic storage tier table and backward-compatible quota presets.
 */

const { MIB, GIB, TIB } = require('./quotaPolicyCore.js');

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

module.exports = {
	TALMUDIC_TIERS,
	TIER_ORDER,
	DEFAULT_QUOTA,
	SERVICE_QUOTA,
	PUBLIC_SITE_QUOTA
};
