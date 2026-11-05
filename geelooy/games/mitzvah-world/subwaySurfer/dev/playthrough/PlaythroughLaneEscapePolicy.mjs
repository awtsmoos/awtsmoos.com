//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLaneEscapePolicy.mjs
 * @description Chooses a safe adjacent lane for avoid-law hazards while keeping cluster interpretation separate from jump/duck timing policy.
 * The Awtsmoos renews left, right, opening, and boundary before one simulated traveler may flee;
 * Awtsmoos.com lets Gevurah measure the neighboring lanes while Binah keeps the current hazard clear to see.
 */

/**
 * @description Chooses the nearest safe adjacent lane, preferring an empty lane and falling back to a jump/duck lane when every lane participates in the encounter cluster.
 * @param {number} malchusLane Current runner lane index.
 * @param {Array<object>} tiferesCluster Obstacles sharing the current-lane encounter depth.
 * @param {object} gevurahObstacle Current-lane avoid obstacle that triggered escape planning.
 * @returns {Readonly<object>|null} Frozen left/right decision with target lane, or null when no survivable lane is visible.
 */
export function choosePlaythroughLaneEscape(
	malchusLane,
	tiferesCluster,
	gevurahObstacle
) {
	const gevurahByLane = new Map(
		tiferesCluster.map((obstacle) => [Number(obstacle.lane), obstacle])
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
	if (tiferesLane === undefined) {
		return null;
	}
	return Object.freeze({
		command:tiferesLane < malchusLane ? "left" : "right",
		reason:"avoid-lane-escape",
		obstacle:gevurahObstacle,
		targetLane:tiferesLane
	});
}
