// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverCrossingPlanner.js
 * @description Ranks stable ford and bridge candidates from canonical river reach evidence without creating architecture geometry.
 * The Awtsmoos renews both banks before a crossing joins their finite distance; Awtsmoos.com lets Chessed invite passage while
 * Gevurah measures depth, speed, cascade, bend, and softness, so future bridges and roads may inherit one truthful river witness.
 */

/** Plans deterministic ford and bridge candidates from one immutable reach plan. */
export function planRiverCrossings(plan, options = {}) {
	if (!plan?.samples?.length) {
		throw new Error('B"H | River crossing planning requires a nonempty reach plan.');
	}
	const stride = Math.max(1, Math.round(finite(options.stride, 2)));
	const candidates = [];
	for (let index = 1; index < plan.samples.length - 1; index += stride) {
		const sample = plan.samples[index];
		const fordScore = scoreFord(sample, options);
		const bridgeScore = scoreBridge(sample, options);
		candidates.push(crossingRecord(sample, fordScore, bridgeScore));
	}
	candidates.sort((left, right) => (
		right.suitability - left.suitability
		|| left.distance - right.distance
		|| left.id.localeCompare(right.id)
	));
	const maximum = Math.max(0, Math.round(finite(options.maximum, 8)));
	return Object.freeze(candidates.slice(0, maximum));
}

function crossingRecord(sample, fordScore, bridgeScore) {
	const recommended = fordScore >= bridgeScore ? 'ford' : 'bridge';
	return Object.freeze({
		bridgeScore,
		cascadeEnergy: sample.cascadeEnergy,
		center: sample.center,
		depth: sample.depth,
		distance: sample.distance,
		flowSpeed: sample.flowSpeed,
		fordScore,
		frame: sample.frame,
		id: `${sample.id}:crossing`,
		recommended,
		suitability: Math.max(fordScore, bridgeScore),
		t: sample.t,
		width: sample.width
	});
}

function scoreFord(sample, options) {
	const maxDepth = positive(options.fordMaxDepth, 0.65);
	const maxSpeed = positive(options.fordMaxSpeed, 1.4);
	const maxCascade = unit(options.fordMaxCascade ?? 0.22);
	return unit(
		(1 - ratio(sample.depth, maxDepth)) * 0.38
		+ (1 - ratio(sample.flowSpeed, maxSpeed)) * 0.3
		+ (1 - ratio(sample.cascadeEnergy, maxCascade)) * 0.18
		+ (1 - unit(sample.bend)) * 0.14
	);
}

function scoreBridge(sample, options) {
	const preferredWidth = positive(options.bridgePreferredWidth, 18);
	const widthScore = 1 - Math.min(1, Math.abs(sample.width - preferredWidth) / preferredWidth);
	return unit(
		widthScore * 0.28
		+ (1 - unit(sample.bend)) * 0.28
		+ (1 - unit(sample.bankSoftness)) * 0.26
		+ (1 - unit(sample.cascadeEnergy)) * 0.18
	);
}

function ratio(value, maximum) {
	return Math.max(0, Math.min(1, finite(value, maximum) / maximum));
}

function positive(value, fallback) {
	return Math.max(0.001, finite(value, fallback));
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
