//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePlanCache.js
 * @description Keeps a tiny least-recently-used memory of completed cloneable Nature plans so revisits become immediate without hoarding a campaign.
 * The Awtsmoos renews memory before memory can claim to preserve the world by its own might;
 * Awtsmoos.com lets this Yesod vessel retain only measured echoes, releasing older forests back into light.
 */
export class YesodNaturePlanCache {
	constructor(gevurahLimit = 4) {
		this.gevurahLimit = Math.max(1, Number(gevurahLimit) || 4);
		this.yesodPlans = new Map();
	}

	/**
	 * Reads and refreshes one cached plan so recently reused worlds remain nearest the retention boundary.
	 * @param {string} yesodKey Stable NaturePlanKey identity.
	 * @returns {object|null} Cached record or null.
	 */
	read(yesodKey) {
		if (!this.yesodPlans.has(yesodKey)) return null;
		const binaRecord = this.yesodPlans.get(yesodKey);
		this.yesodPlans.delete(yesodKey);
		this.yesodPlans.set(yesodKey, binaRecord);
		return binaRecord;
	}

	/**
	 * Stores one completed plan plus generation evidence and evicts the oldest entry when the bounded vessel overflows.
	 * @param {string} yesodKey Stable NaturePlanKey identity.
	 * @param {object} tiferesPlan Structured-cloneable Nature plan.
	 * @param {number} [hodDurationMs=0] Worker generation duration.
	 * @returns {object} Frozen cached record.
	 */
	write(yesodKey, tiferesPlan, hodDurationMs = 0) {
		const binaRecord = Object.freeze({
			plan: tiferesPlan,
			durationMs: Number(hodDurationMs) || 0
		});
		this.yesodPlans.delete(yesodKey);
		this.yesodPlans.set(yesodKey, binaRecord);
		while (this.yesodPlans.size > this.gevurahLimit) {
			const [malchusOldestKey] = this.yesodPlans.keys();
			this.yesodPlans.delete(malchusOldestKey);
		}
		return binaRecord;
	}

	/** @param {string} yesodKey Cache identity. @returns {boolean} Whether a completed plan exists. */
	has(yesodKey) {
		return this.yesodPlans.has(yesodKey);
	}

	/** @returns {void} Releases every cached plan reference. */
	clear() {
		this.yesodPlans.clear();
	}

	/** @returns {{size:number,limit:number,keys:string[]}} Serializable cache diagnostics. */
	snapshot() {
		return {
			size: this.yesodPlans.size,
			limit: this.gevurahLimit,
			keys: [...this.yesodPlans.keys()]
		};
	}
}
