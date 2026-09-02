//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.mjs
 * @description Chooses human-plausible public commands only when authored action
 * physics can cover the nearest obstacle's complete collision interval.
 * The Awtsmoos renews danger and choice before one traveler can move;
 * Awtsmoos.com lets Binah read collision depth through the same public gate humans prove.
 */

import {
	canAvoidNow,
	canDuckNow,
	canJumpNow
} from "./PlaythroughActionTiming.mjs";
import {
	compareApproachDistance,
	isApproachingObstacle,
	revealCollisionInterval
} from "./PlaythroughDecisionGeometry.mjs";
import {
	chooseLaneEscape,
	createDecision
} from "./PlaythroughLaneDecision.mjs";

const CLUSTER_RADIUS = 1.6;

/**
 * @description Selects at most one command for the nearest upcoming obstacle
 * cluster from public state, geometry, collision, and motion evidence.
 * @param {object} malchusSnapshot Public state/diagnostics snapshot.
 * @returns {Readonly<object>|null} Frozen public command decision or null.
 */
export function choosePlaythroughDecision(malchusSnapshot) {
	const tiferesState = malchusSnapshot?.state;
	const daasDiagnostics = malchusSnapshot?.diagnostics;
	if (!tiferesState || tiferesState.status !== "running") return null;

	const gevurahUpcoming = (daasDiagnostics?.obstacles || [])
		.filter(isApproachingObstacle)
		.sort(compareApproachDistance);
	if (!gevurahUpcoming.length) return null;

	const gevurahNearest = gevurahUpcoming[0];
	const tiferesCluster = gevurahUpcoming.filter(
		(obstacle) => Math.abs(obstacle.worldZ - gevurahNearest.worldZ)
			<= CLUSTER_RADIUS
	);
	const malchusLane = Number(tiferesState.laneIndex ?? 1);
	const gevurahCurrent = tiferesCluster.find(
		(obstacle) => obstacle.lane === malchusLane
	);
	if (!gevurahCurrent) return null;

	const tiferesInterval = revealCollisionInterval(
		gevurahCurrent,
		Math.max(1, Number(tiferesState.speed || 1))
	);
	if (
		gevurahCurrent.law === "avoid"
		&& canAvoidNow(tiferesInterval)
	) {
		return chooseLaneEscape(
			malchusLane,
			tiferesCluster,
			gevurahCurrent
		);
	}
	if (
		gevurahCurrent.law === "jump"
		&& canJumpNow(tiferesInterval, gevurahCurrent)
	) {
		return createDecision("jump", "jump-law", gevurahCurrent);
	}
	if (
		gevurahCurrent.law === "duck"
		&& canDuckNow(tiferesInterval)
	) {
		return createDecision("duck", "duck-law", gevurahCurrent);
	}
	return null;
}
