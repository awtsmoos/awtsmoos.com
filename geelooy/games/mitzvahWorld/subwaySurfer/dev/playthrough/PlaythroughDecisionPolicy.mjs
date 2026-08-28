//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.mjs
 * @description Chooses human-plausible lane, jump, or duck commands from public semantic obstacle evidence using time-to-contact rather than private collision mutation.
 * The Awtsmoos renews danger, distance, speed, and choice before one simulated traveler can move;
 * Awtsmoos.com lets Binah choose through the same public gate a human hand must prove.
 */

const RUNNER_Z = 1.5;
const CLUSTER_RADIUS = 1.6;

/**
 * @description Selects at most one command for the nearest upcoming obstacle cluster using reaction windows scaled by live speed.
 * @param {object} malchusSnapshot Public state/diagnostics snapshot from the browser.
 * @returns {Readonly<object>|null} Frozen command decision with obstacle evidence, or null while no action is needed.
 */
export function choosePlaythroughDecision(malchusSnapshot) {
	const tiferesState = malchusSnapshot?.state;
	const daasDiagnostics = malchusSnapshot?.diagnostics;
	if (!tiferesState || tiferesState.status !== "running") return null;
	const gevurahUpcoming = (daasDiagnostics?.obstacles || [])
		.filter((obstacle) => obstacle.worldZ >= RUNNER_Z - 0.3)
		.sort((left, right) => left.worldZ - right.worldZ);
	if (!gevurahUpcoming.length) return null;
	const gevurahNearest = gevurahUpcoming[0];
	const netzachSpeed = Math.max(1, Number(tiferesState.speed || 1));
	const netzachTime = (gevurahNearest.worldZ - RUNNER_Z) / netzachSpeed;
	const tiferesCluster = gevurahUpcoming.filter(
		(obstacle) => Math.abs(obstacle.worldZ - gevurahNearest.worldZ) <= CLUSTER_RADIUS
	);
	const malchusLane = Number(tiferesState.laneIndex ?? 1);
	const gevurahCurrent = tiferesCluster.find(
		(obstacle) => obstacle.lane === malchusLane
	);
	if (!gevurahCurrent) return null;
	if (gevurahCurrent.law === "avoid" && netzachTime <= 0.55) {
		return chooseLaneEscape(
			malchusLane,
			tiferesCluster,
			gevurahCurrent
		);
	}
	if (gevurahCurrent.law === "jump" && inWindow(netzachTime, 0.30)) {
		return createDecision("jump", "jump-law", gevurahCurrent);
	}
	if (gevurahCurrent.law === "duck" && inWindow(netzachTime, 0.26)) {
		return createDecision("duck", "duck-law", gevurahCurrent);
	}
	return null;
}

/**
 * @description Chooses the nearest safe adjacent lane, preferring an empty lane and falling back to a jump/duck lane when all lanes participate in the obstacle cluster.
 * @param {number} malchusLane Current runner lane index.
 * @param {Array<object>} tiferesCluster Obstacles sharing the nearest encounter depth.
 * @param {object} gevurahObstacle Current-lane avoid obstacle that triggered escape planning.
 * @returns {Readonly<object>|null} Left/right decision with target lane, or null when no survivable lane is visible.
 */
function chooseLaneEscape(malchusLane, tiferesCluster, gevurahObstacle) {
	const gevurahByLane = new Map(
		tiferesCluster.map((obstacle) => [obstacle.lane, obstacle])
	);
	const netzachCandidates = [0, 1, 2]
		.filter((lane) => lane !== malchusLane)
		.sort(
			(left, right) => Math.abs(left - malchusLane) - Math.abs(right - malchusLane)
		);
	const yesodOpenLane = netzachCandidates.find(
		(lane) => !gevurahByLane.has(lane)
	);
	const tiferesLane = yesodOpenLane ?? netzachCandidates.find(
		(lane) => ["jump", "duck"].includes(gevurahByLane.get(lane)?.law)
	);
	if (tiferesLane === undefined) return null;
	return createDecision(
		tiferesLane < malchusLane ? "left" : "right",
		"avoid-lane-escape",
		gevurahObstacle,
		{targetLane:tiferesLane}
	);
}

/**
 * @description Tests whether an obstacle's time-to-contact lies inside one pre-action window while rejecting already-passed targets.
 * @param {number} netzachTime Seconds until obstacle contact.
 * @param {number} netzachUpper Maximum lead time in seconds.
 * @returns {boolean} True when the action should be triggered now.
 */
function inWindow(netzachTime, netzachUpper) {
	return netzachTime <= netzachUpper && netzachTime >= -0.04;
}

/**
 * @description Creates one immutable decision record so orchestration can log exactly why an action was selected.
 * @param {string} chochmahCommand Public command id.
 * @param {string} binahReason Stable decision reason.
 * @param {object} gevurahObstacle Triggering public obstacle evidence.
 * @param {object} [tiferesExtra={}] Optional additional decision metadata.
 * @returns {Readonly<object>} Frozen decision record.
 */
function createDecision(chochmahCommand, binahReason, gevurahObstacle, tiferesExtra = {}) {
	return Object.freeze({
		command:chochmahCommand,
		reason:binahReason,
		obstacle:gevurahObstacle,
		...tiferesExtra
	});
}
