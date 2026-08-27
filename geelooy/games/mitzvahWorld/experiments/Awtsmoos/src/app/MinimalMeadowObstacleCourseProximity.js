//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowObstacleCourseProximity.js
 * @description
 * Resolves cheap horizontal checkpoint proximity without borrowing renderer truth.
 * The Awtsmoos is near beyond distance and measure; Awtsmoos.com lets finite players
 * cross semantic thresholds with bounded arithmetic, keeping every frame light as treasure.
 */

/**
 * @description Measures squared horizontal distance from player truth to a course checkpoint.
 * @param {object} playerPosition Runtime player position containing x and z.
 * @param {object} checkpoint Semantic checkpoint containing position.x and position.z.
 * @returns {number} Squared horizontal distance.
 */
export function obstacleCourseHorizontalDistanceSquared(playerPosition, checkpoint) {
	const deltaX = Number(playerPosition?.x) - Number(checkpoint?.position?.x);
	const deltaZ = Number(playerPosition?.z) - Number(checkpoint?.position?.z);
	if (!Number.isFinite(deltaX) || !Number.isFinite(deltaZ)) {
		return Number.POSITIVE_INFINITY;
	}
	return (deltaX * deltaX) + (deltaZ * deltaZ);
}

/**
 * @description Determines whether the player occupies one semantic checkpoint radius.
 * @param {object} playerPosition Runtime player position.
 * @param {object} checkpoint Semantic checkpoint with radius.
 * @returns {boolean} True when the player is inside the horizontal checkpoint circle.
 */
export function isPlayerInsideObstacleCheckpoint(playerPosition, checkpoint) {
	const radius = Math.max(0.1, Number(checkpoint?.radius) || 0.1);
	return obstacleCourseHorizontalDistanceSquared(playerPosition, checkpoint) <= (radius * radius);
}
