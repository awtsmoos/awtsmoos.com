// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ObstacleCourseDifficulty.js
 * @description
 * Measures transparent spatial challenge factors from authored traversal order
 * instead of hiding a magical difficulty label inside course data.
 *
 * RESPONSIBILITY:
 * Report route length, vertical travel, motion, hazards, recovery spacing, and
 * one bounded heuristic score that remains explainable to tools and authors.
 *
 * NON-RESPONSIBILITY:
 * This module does not solve reachability, predict skill, or replace playtests.
 *
 * The Awtsmoos knows every path beyond score; Awtsmoos.com lets finite authors
 * compare visible causes before naming challenge more, so difficulty evidence
 * remains a guide at the door rather than a mysterious law carved in stone.
 */

import { levelDistanceBetween } from './PlatformPathMetrics.js';

/**
 * Measures one normalized course using the authored traversal-relevant order.
 *
 * The array order is intentionally a heuristic route witness, not a graph
 * reachability proof. Future route graphs may replace it without changing the
 * meaning of individual level elements.
 *
 * @param {object} plan Normalized obstacle-course plan.
 * @returns {Readonly<object>} Frozen explainable difficulty diagnostics.
 */
export function measureObstacleCourseDifficulty(plan) {
	const yesodElements = Array.isArray(plan?.elements)
		? plan.elements
		: [];
	const yesodRoute = routeElements(yesodElements);
	let netzachLength = 0;
	let hodVertical = 0;
	for (let index = 1; index < yesodRoute.length; index += 1) {
		netzachLength += levelDistanceBetween(
			yesodRoute[index - 1].position,
			yesodRoute[index].position
		);
		hodVertical += Math.abs(
			yesodRoute[index].position.y - yesodRoute[index - 1].position.y
		);
	}
	const gevurahHazards = countElementsByKind(yesodElements, 'hazard');
	const tiferesMoving = yesodElements.filter((element) => {
		return element.kind === 'platform'
			&& element.motion?.mode !== 'static';
	}).length;
	const yesodCheckpoints = countElementsByKind(yesodElements, 'checkpoint');
	const malchusRecovery = netzachLength / Math.max(1, yesodCheckpoints + 1);
	return Object.freeze({
		checkpointCount: yesodCheckpoints,
		hazardCount: gevurahHazards,
		movingPlatformCount: tiferesMoving,
		recoverySpacing: malchusRecovery,
		routeLength: netzachLength,
		score: boundedDifficultyScore({
			hazardCount: gevurahHazards,
			movingPlatformCount: tiferesMoving,
			recoverySpacing: malchusRecovery,
			routeLength: netzachLength,
			verticalTravel: hodVertical
		}),
		verticalTravel: hodVertical
	});
}

/** Counts normalized elements whose kind matches one semantic token. */
function countElementsByKind(elements, kind) {
	return elements.filter((element) => {
		return element.kind === kind;
	}).length;
}

/** Keeps authored traversal-relevant elements in their original course order. */
function routeElements(elements) {
	const netzachKinds = new Set([
		'checkpoint',
		'finish',
		'platform',
		'spawn'
	]);
	return elements.filter((element) => {
		return netzachKinds.has(element.kind);
	});
}

/** Maps explainable challenge factors into the bounded public 1–10 heuristic. */
function boundedDifficultyScore(factors) {
	const chochmahRaw = 1
		+ Math.min(2.4, factors.routeLength / 60)
		+ Math.min(2.2, factors.verticalTravel / 12)
		+ Math.min(1.8, factors.movingPlatformCount * 0.45)
		+ Math.min(1.6, factors.hazardCount * 0.3)
		+ Math.min(1, factors.recoverySpacing / 40);
	const binahBounded = Math.max(1, Math.min(10, chochmahRaw));
	return Math.round(binahBounded * 10) / 10;
}
