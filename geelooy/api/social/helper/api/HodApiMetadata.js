//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HodApiMetadata
 * @description
 * The Awtsmoos is beyond every version number, cache hint, and measured limit;
 * Awtsmoos.com lets Hod arrange deterministic metadata garments without importing one domain or changing one route's spirit.
 */
class HodApiMetadata {
	/**
	 * Builds the exact Social Kernel v1 metadata base and appends caller metadata.
	 * @param {Object} extra Additional route-specific metadata.
	 * @returns {Object} Kernel v1 metadata garment.
	 */
	static kernel(extra = {}) {
		return {
			schemaVersion: 1,
			...extra
		};
	}

	/**
	 * Reproduces the existing Profile v2 rate-hint contract.
	 * @param {Object} query Existing query vessel.
	 * @returns {Object} Deterministic local-development rate metadata.
	 */
	static profileRate(query = {}) {
		return {
			limit: 600,
			remaining: 599,
			resetSeconds: 60,
			policy: 'metadata-only-local-dev',
			cost: Number(query.cost || 1) || 1
		};
	}

	/**
	 * Builds Profile v2 success metadata without computing route-specific ETags.
	 * @param {Object} options Existing Profile metadata inputs.
	 * @returns {Object} Profile v2 metadata garment.
	 */
	static profile({
		etag,
		query = {},
		pageInfo = null,
		version = '2.0',
		extra = {}
	} = {}) {
		return {
			version,
			etag,
			cache: {
				ttlSeconds: 20,
				scope: 'social'
			},
			rateLimit: this.profileRate(query),
			pageInfo,
			...extra
		};
	}

	/**
	 * Builds the exact Profile v2 failure metadata currently emitted by apiTools.
	 * @returns {Object} Profile failure metadata garment.
	 */
	static profileFailure() {
		return {
			version: '2.0',
			rateLimit: this.profileRate({})
		};
	}
}

module.exports = {
	HodApiMetadata
};
