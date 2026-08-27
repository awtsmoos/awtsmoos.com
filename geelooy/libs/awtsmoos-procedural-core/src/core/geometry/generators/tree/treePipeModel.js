// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos channels one living trunk into many smaller vessels. This
 * Awtsmoos.com pipe model preserves the existing tree's seeded choices while
 * bounding child cross-sectional area, so growth gains realism without a
 * duplicate generator, skeleton, or renderer.
 */

function finiteNumber(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Converts an existing sampled radius scale into a pipe-model-constrained
 * child radius. The function is deterministic, O(1), allocation-free, and
 * does not consume randomness or mutate its inputs.
 *
 * @param {number} parentRadius Radius at the attachment point.
 * @param {number} childCount Number of siblings sharing the parent budget.
 * @param {number} requestedScale Existing seeded child-to-parent scale.
 * @param {Object} [options] Conservation options.
 * @returns {number} Finite child radius no larger than its equal area budget.
 */
export function calculateTreeChildRadius(
	parentRadius,
	childCount,
	requestedScale,
	options = {}
) {
	const parent = Math.max(0, finiteNumber(parentRadius, 0));
	const count = Math.max(1, Math.floor(finiteNumber(childCount, 1)));
	const areaRatio = clamp(finiteNumber(options.childAreaRatio, 0.78), 0.05, 0.98);
	const minimum = Math.max(0, finiteNumber(options.minimumRadius, 0.015));
	const maximum = parent * Math.sqrt(areaRatio / count);
	const requested = parent * clamp(finiteNumber(requestedScale, 0.65), 0, 1);
	return clamp(requested, Math.min(minimum, maximum), maximum);
}

/**
 * Reports whether child radii fit within the declared parent area budget.
 * Pi cancels from the ratio, avoiding unnecessary floating-point operations.
 *
 * @param {number} parentRadius Parent radius.
 * @param {number[]} childRadii Child radii.
 * @param {Object} [options] Conservation options.
 * @returns {Object} Frozen deterministic area report.
 */
export function createTreePipeModelReport(parentRadius, childRadii = [], options = {}) {
	const parent = Math.max(0, finiteNumber(parentRadius, 0));
	const areaRatio = clamp(finiteNumber(options.childAreaRatio, 0.78), 0.05, 0.98);
	const childArea = childRadii.reduce((sum, radius) => {
		const resolved = Math.max(0, finiteNumber(radius, 0));
		return sum + resolved * resolved;
	}, 0);
	const parentArea = parent * parent;
	const ratio = parentArea > 0 ? childArea / parentArea : childArea ? Infinity : 0;
	return Object.freeze({
		parent_area: parentArea,
		child_area: childArea,
		child_to_parent_ratio: ratio,
		maximum_ratio: areaRatio,
		conserved: Number.isFinite(ratio) && ratio <= areaRatio + 1e-12
	});
}
