// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverWorldInfluence.js
 * @description Queries canonical reach evidence as channel, riparian, floodplain, moisture, and settlement-clearance intent.
 * The Awtsmoos renews river and shore before any house or reed asks how near the water stands; Awtsmoos.com lets one
 * neutral Yesod-like query carry that relationship outward without making villages, vegetation, or renderers learn river internals.
 */

/** Spatial query facade over one immutable river reach plan. */
export class RiverWorldInfluence {
	/** @param {object} plan Canonical river reach plan. */
	constructor(plan) {
		if (!plan?.samples?.length) {
			throw new Error('B"H | RiverWorldInfluence requires a nonempty reach plan.');
		}
		this.plan = plan;
		Object.freeze(this);
	}

	/** Returns distance, signed lateral offset, moisture, and region evidence for one X/Z point. */
	query(x, z) {
		const nearest = nearestSample(this.plan.samples, x, z);
		const signedDistance = signedLateralDistance(nearest, x, z);
		const distance = Math.abs(signedDistance);
		const channelHalfWidth = nearest.width * 0.5;
		return Object.freeze({
			channelHalfWidth,
			distance,
			floodplainHalfWidth: nearest.floodplainHalfWidth,
			moisture: moisture(distance, channelHalfWidth, nearest.floodplainHalfWidth),
			nearestSampleId: nearest.id,
			region: region(distance, channelHalfWidth, nearest),
			riparianHalfWidth: nearest.riparianHalfWidth,
			signedDistance,
			t: nearest.t
		});
	}

	/** Adapts floodplain evidence into conservative circular exclusions understood by the current village planner. */
	villageExclusions(options = {}) {
		const stride = Math.max(1, Math.round(finite(options.stride, 2)));
		const margin = Math.max(0, finite(options.margin, 2));
		const exclusions = [];
		for (let index = 0; index < this.plan.samples.length; index += stride) {
			const sample = this.plan.samples[index];
			exclusions.push(Object.freeze({
				id: `${sample.id}:floodplain`,
				radius: sample.floodplainHalfWidth + margin,
				x: sample.center.x,
				z: sample.center.z
			}));
		}
		return Object.freeze(exclusions);
	}
}

/** Creates one reusable immutable river-world influence facade. */
export function createRiverWorldInfluence(plan) {
	return new RiverWorldInfluence(plan);
}

function nearestSample(samples, x, z) {
	let best = samples[0];
	let bestDistance = Infinity;
	for (const sample of samples) {
		const distance = Math.hypot(x - sample.center.x, z - sample.center.z);
		if (distance < bestDistance) {
			best = sample;
			bestDistance = distance;
		}
	}
	return best;
}

function signedLateralDistance(sample, x, z) {
	const dx = x - sample.center.x;
	const dz = z - sample.center.z;
	return dx * sample.frame.lateral.x + dz * sample.frame.lateral.z;
}

function region(distance, channelHalfWidth, sample) {
	if (distance <= channelHalfWidth) return 'channel';
	if (distance <= sample.riparianHalfWidth) return 'riparian';
	if (distance <= sample.floodplainHalfWidth) return 'floodplain';
	return 'outside';
}

function moisture(distance, channelHalfWidth, floodplainHalfWidth) {
	if (distance <= channelHalfWidth) return 1;
	const span = Math.max(0.001, floodplainHalfWidth - channelHalfWidth);
	return Math.max(0, Math.min(1, 1 - (distance - channelHalfWidth) / span));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
