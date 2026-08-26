// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeMechanicalVitality.js
 * @description Derives bounded wind-load, slenderness, branch reserve, and recovery pressure from canonical anatomy without claiming structural simulation.
 * The Awtsmoos renews rooted trunk and answering twig before wind can seem to divide strength from motion;
 * Awtsmoos.com lets those finite coefficients reveal mechanical vitality while one immutable skeleton remains the only tree in creation.
 */

/**
 * Creates a renderer-neutral mechanical vitality profile from existing wind-response metadata and development evidence.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} anatomy Anatomy bundle containing deterministic wind coefficients.
 * @param {object|null} development Optional development profile.
 * @param {object} environment Renderer-neutral environment intent.
 * @param {object} [options={}] Optional mechanical tuning values.
 * @returns {Readonly<object>} Frozen relative vitality signals, not a physics solver result.
 */
export function createTreeMechanicalVitality(skeleton, anatomy, development, environment, options = {}) {
	const branchResponses = anatomy?.wind?.branches || [];
	const averages = meanWindResponse(branchResponses);
	const windExposure = unit((environment?.wind?.strength ?? 0.42) / 4, 0.105);
	const mortality = unit(development?.branchMortality, 0.12);
	const slenderness = treeSlenderness(skeleton);
	const loadPressure = unit(
		windExposure * 0.42
		+ normalizedRatio(averages.drag, averages.stiffness) * 0.36
		+ slenderness * 0.22,
		0.25
	);
	const mechanicalReserve = unit(
		1
		- loadPressure * 0.62
		- mortality * 0.24
		+ unit(options.reinforcement, 0) * 0.16,
		0.6
	);
	const recoveryPotential = unit(
		mechanicalReserve * 0.48
		+ unit(development?.vigor, 0.68) * 0.42
		+ (1 - mortality) * 0.1,
		0.6
	);
	return Object.freeze({
		averageBend: round(averages.bend),
		averageDrag: round(averages.drag),
		averageStiffness: round(averages.stiffness),
		failurePressure: round(unit(loadPressure * 0.74 + mortality * 0.26, 0)),
		loadPressure: round(loadPressure),
		mechanicalReserve: round(mechanicalReserve),
		recoveryPotential: round(recoveryPotential),
		slenderness: round(slenderness),
		windExposure: round(windExposure)
	});
}

/** Averages deterministic branch-response coefficients without retaining branch arrays. */
function meanWindResponse(branches) {
	if (!branches.length) return { bend: 0, drag: 0, stiffness: 1 };
	const totals = branches.reduce((state, branch) => {
		state.bend += finite(branch.bend);
		state.drag += finite(branch.drag);
		state.stiffness += finite(branch.stiffness);
		return state;
	}, { bend: 0, drag: 0, stiffness: 0 });
	return {
		bend: totals.bend / branches.length,
		drag: totals.drag / branches.length,
		stiffness: totals.stiffness / branches.length
	};
}

/** Compresses geometric height/radius ratio into one bounded relative slenderness pressure. */
function treeSlenderness(skeleton) {
	const trunk = (skeleton?.branches || []).find(branch => !branch.parentId && !branch.parentNodeId);
	const baseRadius = Math.max(0.0001, finite(trunk?.nodes?.[0]?.radius, 0.1));
	const maxHeight = (skeleton?.branches || []).flatMap(branch => branch.nodes || [])
		.reduce((maximum, node) => Math.max(maximum, finite(node.position?.[1], 0)), 0);
	return unit((maxHeight / Math.max(0.2, baseRadius * 2)) / 80, 0.4);
}

function normalizedRatio(numerator, denominator) {
	const ratio = Math.max(0, finite(numerator)) / Math.max(0.0001, finite(denominator, 1));
	return ratio / (1 + ratio);
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function unit(value, fallback) {
	return Math.max(0, Math.min(1, finite(value, fallback)));
}

function round(value) {
	return Math.round(Number(value) * 1e6) / 1e6;
}
