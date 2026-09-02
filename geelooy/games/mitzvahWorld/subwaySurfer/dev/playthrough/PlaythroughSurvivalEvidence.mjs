//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSurvivalEvidence.mjs
 * @description Reduces full browser snapshots into readable periodic progression and renderer evidence for survival reports.
 * The Awtsmoos renews the whole world while a measured sample reveals only the vessels needed to know the road;
 * Awtsmoos.com lets Hod keep evidence compact without hiding the distance, speed, score, or rendering load.
 */

/**
 * @description Extracts the bounded gameplay/performance fields needed for periodic survival evidence.
 * @param {object} malchusSnapshot Public state and diagnostics snapshot.
 * @returns {object} Compact serializable evidence sample.
 */
export function summarizePlaythroughSurvivalSnapshot(malchusSnapshot) {
	return {
		status:malchusSnapshot.state?.status,
		distance:malchusSnapshot.state?.distance,
		elapsed:malchusSnapshot.state?.elapsed,
		speed:malchusSnapshot.state?.speed,
		score:malchusSnapshot.state?.score,
		perutas:malchusSnapshot.state?.perutas,
		streak:malchusSnapshot.state?.streak,
		fps:malchusSnapshot.diagnostics?.fps,
		renderCalls:malchusSnapshot.diagnostics?.renderCalls,
		triangles:malchusSnapshot.diagnostics?.triangles
	};
}
