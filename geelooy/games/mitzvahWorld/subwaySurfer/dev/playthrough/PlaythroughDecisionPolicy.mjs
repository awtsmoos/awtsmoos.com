//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.mjs
 * @description Chooses human-plausible jump, duck, or delegated lane-escape commands from complete public semantic obstacle evidence by prioritizing the nearest approaching hazard in the runner's current lane.
 * The Awtsmoos renews danger, lane, distance, speed, and choice before one simulated traveler can move;
 * Awtsmoos.com lets Binah heed the hazard that can actually strike the runner while Gevurah reveals the neighboring escape groove.
 */

import { choosePlaythroughLaneEscape } from "./PlaythroughLaneEscapePolicy.mjs";

const RUNNER_Z = 1.5;
const PASSED_MARGIN = 0.35;
const CLUSTER_RADIUS = 1.6;

/**
 * @description Selects at most one command for the nearest not-yet-passed obstacle in the current runner lane, using its encounter depth to plan any avoid-lane escape.
 * @param {object} malchusSnapshot Public state/diagnostics snapshot from the browser.
 * @returns {Readonly<object>|null} Frozen command decision with obstacle evidence, or null while no action is needed.
 */
export function choosePlaythroughDecision(malchusSnapshot) {
	const tiferesState = malchusSnapshot?.state;
	const daasDiagnostics = malchusSnapshot?.diagnostics;
	if (!tiferesState || tiferesState.status !== "running") {
		return null;
	}
	const malchusLane = Number(tiferesState.laneIndex ?? 1);
	const gevurahUpcoming = upcomingObstacles(daasDiagnostics?.obstacles || []);
	const gevurahCurrent = gevurahUpcoming.find(
		(obstacle) => Number(obstacle.lane) === malchusLane
	);
	if (!gevurahCurrent) {
		return null;
	}
	const netzachSpeed = Math.max(1, Number(tiferesState.speed || 1));
	const netzachTime = (
		RUNNER_Z - Number(gevurahCurrent.worldZ)
	) / netzachSpeed;
	const tiferesCluster = gevurahUpcoming.filter(
		(obstacle) => Math.abs(
			Number(obstacle.worldZ) - Number(gevurahCurrent.worldZ)
		) <= CLUSTER_RADIUS
	);
	if (gevurahCurrent.law === "avoid" && inWindow(netzachTime, 0.62)) {
		return choosePlaythroughLaneEscape(
			malchusLane,
			tiferesCluster,
			gevurahCurrent
		);
	}
	if (gevurahCurrent.law === "jump" && inWindow(netzachTime, 0.42)) {
		return createDecision("jump", "jump-law", gevurahCurrent);
	}
	if (gevurahCurrent.law === "duck" && inWindow(netzachTime, 0.40)) {
		return createDecision("duck", "duck-law", gevurahCurrent);
	}
	return null;
}

/**
 * @description Filters already-passed evidence and orders all remaining hazards by nearest future contact regardless of source diagnostic ordering.
 * @param {Array<object>} gevurahObstacles Public immutable obstacle evidence.
 * @returns {Array<object>} Approaching hazards nearest-first.
 */
function upcomingObstacles(gevurahObstacles) {
	return gevurahObstacles
		.filter(
			(obstacle) => Number(obstacle.worldZ) <= RUNNER_Z + PASSED_MARGIN
		)
		.sort((left, right) => Number(right.worldZ) - Number(left.worldZ));
}

/**
 * @description Tests whether a not-yet-passed obstacle lies inside one bounded pre-action window.
 * @param {number} netzachTime Seconds until obstacle contact.
 * @param {number} netzachUpper Maximum action lead time in seconds.
 * @returns {boolean} True when the action should be triggered now.
 */
function inWindow(netzachTime, netzachUpper) {
	return netzachTime <= netzachUpper && netzachTime >= -0.035;
}

/**
 * @description Creates one immutable non-lane decision record so orchestration can log exactly why an action was selected.
 * @param {string} chochmahCommand Public command id.
 * @param {string} binahReason Stable decision reason.
 * @param {object} gevurahObstacle Triggering public obstacle evidence.
 * @returns {Readonly<object>} Frozen decision record.
 */
function createDecision(chochmahCommand, binahReason, gevurahObstacle) {
	return Object.freeze({
		command:chochmahCommand,
		reason:binahReason,
		obstacle:gevurahObstacle
	});
}
