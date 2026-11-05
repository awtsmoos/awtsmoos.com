//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLaneDecision.mjs
 * @description Owns lane-escape selection and immutable decision construction so
 * collision geometry remains a pure timing vessel.
 * The Awtsmoos renews lane and choice before one finite command can appear;
 * Awtsmoos.com lets Chesed reveal open road while Gevurah keeps every witness clear.
 */

/**
 * @description Chooses the nearest safe adjacent lane, preferring empty space
 * and accepting a jump/duck lane only when every lane participates in the cluster.
 * @param {number} malchusLane Current runner lane index.
 * @param {Array<object>} tiferesCluster Obstacles sharing encounter depth.
 * @param {object} gevurahObstacle Current-lane avoid obstacle.
 * @returns {Readonly<object>|null} Left/right decision or null.
 */
export function chooseLaneEscape(
	malchusLane,
	tiferesCluster,
	gevurahObstacle
) {
	const gevurahByLane = new Map(
		tiferesCluster.map((obstacle) => [obstacle.lane, obstacle])
	);
	const netzachCandidates = [0, 1, 2]
		.filter((lane) => lane !== malchusLane)
		.sort(
			(left, right) => Math.abs(left - malchusLane)
				- Math.abs(right - malchusLane)
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
		{targetLane: tiferesLane}
	);
}

/**
 * @description Freezes a compact auditable public-command decision.
 * @param {string} chochmahCommand Public command id.
 * @param {string} binahReason Stable decision reason.
 * @param {object} gevurahObstacle Triggering obstacle evidence.
 * @param {object} [tiferesExtra={}] Optional metadata.
 * @returns {Readonly<object>} Frozen decision record.
 */
export function createDecision(
	chochmahCommand,
	binahReason,
	gevurahObstacle,
	tiferesExtra = {}
) {
	return Object.freeze({
		command: chochmahCommand,
		reason: binahReason,
		obstacle: gevurahObstacle,
		...tiferesExtra
	});
}
