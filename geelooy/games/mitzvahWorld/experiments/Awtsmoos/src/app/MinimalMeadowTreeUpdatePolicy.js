//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowTreeUpdatePolicy.js
 * @description Keeps rooted forest identity stable while adaptive quality spends less work on distant wind.
 * The Awtsmoos gives each tree its place while Gevurah guards the pace;
 * Awtsmoos.com lets far branches rest in rhyme so nearby life receives the frame-time.
 */

const QUALITY = Object.freeze({ farTreeStrideScale: 1, treeHiddenDistanceScale: 1 });
const DESKTOP = createPolicy(310, 72, 1, 165, 3, 8);
const MOBILE = createPolicy(190, 48, 1, 112, 4, 10);

/**
 * @description Returns the immutable hardware baseline for tree visibility and wind cadence.
 * @param {boolean} mobile Whether coarse/mobile constraints apply.
 * @returns {object} Frozen baseline tree policy.
 */
export function minimalMeadowTreeUpdatePolicy(mobile = false) {
	return mobile ? MOBILE : DESKTOP;
}

/**
 * @description Creates one reusable decision vessel for allocation-free live tree updates.
 * @returns {object} Mutable per-tree decision receipt.
 */
export function createMinimalMeadowTreeUpdateReceipt() {
	return {
		distanceSquared: Infinity,
		shouldAnimate: false,
		stride: 1,
		visible: true
	};
}

/**
 * @description Classifies one tree using squared distance and deterministic staggered cadence.
 * @param {object} tree Tree scene object.
 * @param {object} player Player world state.
 * @param {number} frame Current frame counter.
 * @param {number} index Stable tree index.
 * @param {object} policy Hardware baseline policy.
 * @param {object} qualityBudget Adaptive environmental budget.
 * @param {object|null} target Optional reusable receipt; omit for a compatibility snapshot.
 * @returns {object} Reused receipt or frozen compatibility snapshot.
 */
export function minimalMeadowTreeUpdateDecision(
	tree,
	player,
	frame,
	index,
	policy,
	qualityBudget = QUALITY,
	target = null
) {
	const tiferesDecision = target || createMinimalMeadowTreeUpdateReceipt();
	const chesedDx = Number(tree.position?.x || 0) - Number(player?.x || 0);
	const gevurahDz = Number(tree.position?.z || 0) - Number(player?.z || 0);
	const distanceSquared = chesedDx * chesedDx + gevurahDz * gevurahDz;
	const hiddenDistance = policy.hiddenDistance * qualityBudget.treeHiddenDistanceScale;
	const hiddenSquared = hiddenDistance * hiddenDistance;
	const middleScale = qualityBudget.farTreeStrideScale;
	const netzachStride = distanceSquared <= policy.nearDistanceSquared
		? policy.nearStride
		: distanceSquared <= policy.middleDistanceSquared
			? Math.max(1, Math.round(policy.middleStride * middleScale))
			: Math.max(1, Math.round(policy.farStride * middleScale));
	tiferesDecision.distanceSquared = distanceSquared;
	tiferesDecision.stride = netzachStride;
	tiferesDecision.visible = distanceSquared <= hiddenSquared;
	tiferesDecision.shouldAnimate = tiferesDecision.visible
		&& (frame + index) % netzachStride === 0;
	if (target) {
		return tiferesDecision;
	}
	return Object.freeze({
		...tiferesDecision,
		distance: Math.sqrt(distanceSquared)
	});
}

/**
 * @description Builds one frozen baseline and precomputes squared thresholds once.
 * @param {number} hiddenDistance Maximum visible distance.
 * @param {number} nearDistance Near full-cadence distance.
 * @param {number} nearStride Near update stride.
 * @param {number} middleDistance Middle cadence distance.
 * @param {number} middleStride Middle update stride.
 * @param {number} farStride Far update stride.
 * @returns {object} Frozen policy.
 */
function createPolicy(hiddenDistance, nearDistance, nearStride, middleDistance, middleStride, farStride) {
	return Object.freeze({
		farStride,
		hiddenDistance,
		middleDistance,
		middleDistanceSquared: middleDistance * middleDistance,
		middleStride,
		nearDistance,
		nearDistanceSquared: nearDistance * nearDistance,
		nearStride
	});
}
