//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.mjs
 * @description Chooses human-plausible public commands only when authored action
 * physics can cover the nearest current-lane obstacle's full collision interval.
 * The Awtsmoos renews danger and choice before one traveler can move;
 * Awtsmoos.com lets Binah read collision depth while Gevurah reveals an open lane groove.
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
import { choosePlaythroughLaneEscape } from "./PlaythroughLaneEscapePolicy.mjs";

const CLUSTER_RADIUS = 1.6;

/**
 * @description Selects at most one command for the nearest actionable current-lane
 * obstacle using public state, collision geometry, and semantic motion evidence.
 * @param {object} malchusSnapshot Public state/diagnostics snapshot.
 * @returns {Readonly<object>|null} Frozen public command decision or null.
 */
export function choosePlaythroughDecision(malchusSnapshot) {
	const tiferesState = malchusSnapshot?.state;
	const daasDiagnostics = malchusSnapshot?.diagnostics;
	if (!tiferesState || tiferesState.status !== "running") {
		return null;
	}
	const malchusLane = Number(tiferesState.laneIndex ?? 1);
	const gevurahUpcoming = (daasDiagnostics?.obstacles || [])
		.filter(isApproachingObstacle)
		.sort(compareApproachDistance);
	const gevurahCurrent = gevurahUpcoming.find(
		(obstacle) => Number(obstacle.lane) === malchusLane
	);
	if (!gevurahCurrent) {
		return null;
	}
	const tiferesCluster = gevurahUpcoming.filter(
		(obstacle) => Math.abs(
			Number(obstacle.worldZ) - Number(gevurahCurrent.worldZ)
		) <= CLUSTER_RADIUS
	);
	const tiferesInterval = revealCollisionInterval(
		gevurahCurrent,
		Math.max(1, Number(tiferesState.speed || 1))
	);
	if (gevurahCurrent.law === "avoid" && canAvoidNow(tiferesInterval)) {
		return choosePlaythroughLaneEscape(
			malchusLane,
			tiferesCluster,
			gevurahCurrent
		);
	}
	if (gevurahCurrent.law === "jump" && canJumpNow(tiferesInterval, gevurahCurrent)) {
		return createDecision("jump", "jump-law", gevurahCurrent);
	}
	if (gevurahCurrent.law === "duck" && canDuckNow(tiferesInterval)) {
		return createDecision("duck", "duck-law", gevurahCurrent);
	}
	return null;
}

/**
 * @description Creates one immutable non-lane decision record for auditable proof.
 * @param {string} chochmahCommand Public command id.
 * @param {string} binahReason Stable decision reason.
 * @param {object} gevurahObstacle Triggering immutable obstacle evidence.
 * @returns {Readonly<object>} Frozen decision record.
 */
function createDecision(chochmahCommand, binahReason, gevurahObstacle) {
	return Object.freeze({
		command: chochmahCommand,
		reason: binahReason,
		obstacle: gevurahObstacle
	});
}
