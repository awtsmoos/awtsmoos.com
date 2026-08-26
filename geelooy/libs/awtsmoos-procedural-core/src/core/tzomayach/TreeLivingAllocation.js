// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeLivingAllocation.js
 * @description Measures renderer-neutral structural investment across roots, trunk, branches, and canopy from one already-canonical tree.
 * The Awtsmoos renews hidden root and visible crown before either can claim a separate treasury;
 * Awtsmoos.com lets their measured vessels become one immutable allocation witness without changing a node, radius, leaf, or skeleton story.
 */

/**
 * Creates structural investment proxies from canonical skeleton and additive anatomy only.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} anatomy Anatomy bundle bound to the same skeleton hash.
 * @returns {Readonly<object>} Frozen allocation ratios and raw structural proxies.
 */
export function createTreeLivingAllocation(skeleton, anatomy) {
	const branches = Array.isArray(skeleton?.branches) ? skeleton.branches : [];
	const leaves = Array.isArray(skeleton?.leaves) ? skeleton.leaves : [];
	const roots = Array.isArray(anatomy?.roots) ? anatomy.roots : [];
	const trunk = branches.filter(isTrunk).reduce((sum, branch) => sum + branchVolume(branch), 0);
	const branchWood = branches.filter(branch => !isTrunk(branch))
		.reduce((sum, branch) => sum + branchVolume(branch), 0);
	const rootWood = roots.reduce((sum, root) => {
		return sum + Math.PI * square(positive(root.radius)) * positive(root.length);
	}, 0);
	const canopyArea = leaves.reduce((sum, leaf) => {
		return sum + Math.PI * square(positive(leaf.size));
	}, 0);
	const canopyInvestment = canopyArea * 0.035;
	const total = Math.max(1e-9, trunk + branchWood + rootWood + canopyInvestment);
	const rootFraction = rootWood / total;
	const canopyFraction = canopyInvestment / total;
	return Object.freeze({
		branchFraction: ratio(branchWood, total),
		canopyArea: round(canopyArea),
		canopyFraction: round(canopyFraction),
		raw: Object.freeze({
			branchWood: round(branchWood),
			canopyInvestment: round(canopyInvestment),
			rootWood: round(rootWood),
			trunkWood: round(trunk)
		}),
		rootCanopyRatio: round(rootFraction / Math.max(0.0001, canopyFraction)),
		rootFraction: round(rootFraction),
		trunkFraction: ratio(trunk, total),
		woodFraction: ratio(trunk + branchWood + rootWood, total)
	});
}

/** Estimates cylindrical branch volume across canonical node segments. */
function branchVolume(branch) {
	const nodes = Array.isArray(branch?.nodes) ? branch.nodes : [];
	let volume = 0;
	for (let index = 1; index < nodes.length; index += 1) {
		const previous = nodes[index - 1];
		const current = nodes[index];
		const radius = (positive(previous.radius) + positive(current.radius)) * 0.5;
		volume += Math.PI * radius * radius * distance(previous.position, current.position);
	}
	return volume;
}

/** Identifies structural trunk branches across historical parent-id conventions. */
function isTrunk(branch) {
	return !branch?.parentId && !branch?.parentNodeId;
}

/** Measures Euclidean distance between two finite three-axis positions. */
function distance(start = [0, 0, 0], end = [0, 0, 0]) {
	return Math.hypot(
		Number(end[0] || 0) - Number(start[0] || 0),
		Number(end[1] || 0) - Number(start[1] || 0),
		Number(end[2] || 0) - Number(start[2] || 0)
	);
}

/** Converts one candidate magnitude into a non-negative finite scalar. */
function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

function square(value) {
	return value * value;
}

function ratio(value, total) {
	return round(value / Math.max(1e-9, total));
}

function round(value) {
	return Math.round(Number(value) * 1e6) / 1e6;
}
