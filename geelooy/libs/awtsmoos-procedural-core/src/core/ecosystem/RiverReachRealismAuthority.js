// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverReachRealismAuthority.js
 * @description Applies immutable reach-scale morphology intent to existing river evidence without creating a second fluid solver.
 * The Awtsmoos, Atzmus beyond broad pool and narrow riffle, renews one river while each reach receives its truthful measured face;
 * Awtsmoos.com lets authored geography shape width, depth, wetness, and flow before the shared solver animates that singular river in place.
 */

/** Immutable reach-level river realism policy. */
export class RiverReachRealismAuthority {
	/**
	 * @param {Array<object>} reaches Ordered normalized-t reach policies.
	 */
	constructor(reaches = []) {
		this.reaches = Object.freeze(reaches.map((reach, index) => normalizeReach(reach, index)));
	}

	/**
	 * Applies matching reach scales to existing river evidence.
	 * @param {number} progress Normalized 0..1 downstream progress.
	 * @param {object} [base={}] Existing width/depth/speed/wetness/cascade evidence.
	 * @returns {Readonly<object>} Scaled evidence with matched reach metadata.
	 */
	sample(progress, base = {}) {
		const t = clamp01(progress);
		const reach = this.reachAt(t);
		if (!reach) return Object.freeze({ ...base, t });
		return Object.freeze({
			...base,
			bankSoftness: clamp01(
				finite(base.bankSoftness, 0.5) + reach.bankSoftnessOffset
			),
			bankWetness: clamp01(
				finite(base.bankWetness, base.wetness ?? 0) + reach.bankWetnessOffset
			),
			cascadeEnergy: Math.max(
				0,
				finite(base.cascadeEnergy, base.cascade ?? 0) * reach.cascadeScale
			),
			depth: Math.max(0.02, finite(base.depth, 0) * reach.depthScale),
			flowSpeed: Math.max(
				0,
				finite(base.flowSpeed, base.speed ?? 0) * reach.flowScale
			),
			habitat: reach.habitat,
			poolStrength: reach.poolStrength,
			reachId: reach.id,
			riffleStrength: reach.riffleStrength,
			t,
			width: Math.max(0.1, finite(base.width, 0) * reach.widthScale)
		});
	}

	/** Returns the reach matching normalized downstream progress. */
	reachAt(progress) {
		const t = clamp01(progress);
		return this.reaches.find((reach, index) => (
			t >= reach.from
			&& (t < reach.to || index === this.reaches.length - 1)
		)) || null;
	}
}

/** Creates one immutable reach-realism authority. */
export function createRiverReachRealismAuthority(reaches = []) {
	return new RiverReachRealismAuthority(reaches);
}

function normalizeReach(reach, index) {
	const from = clamp01(reach.from ?? reach.t0 ?? 0);
	const to = clamp01(reach.to ?? reach.t1 ?? 1);
	if (to < from) throw new Error(`B"H | River reach ${reach.id || index} ends before it begins.`);
	return Object.freeze({
		bankSoftnessOffset: finite(reach.bankSoftnessOffset, 0),
		bankWetnessOffset: finite(reach.bankWetnessOffset, 0),
		cascadeScale: positive(reach.cascadeScale, 1),
		depthScale: positive(reach.depthScale, 1),
		flowScale: positive(reach.flowScale, 1),
		from,
		habitat: Object.freeze([...(reach.habitat || [])]),
		id: String(reach.id || `reach-${index}`),
		poolStrength: clamp01(reach.poolStrength ?? 0),
		riffleStrength: clamp01(reach.riffleStrength ?? 0),
		to,
		widthScale: positive(reach.widthScale, 1)
	});
}

function positive(value, fallback) {
	return Math.max(0.01, finite(value, fallback));
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
