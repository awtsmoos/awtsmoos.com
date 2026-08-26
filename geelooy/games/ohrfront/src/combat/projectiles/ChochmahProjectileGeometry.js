// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahProjectileGeometry.js
 * @description Reveals pure scalar geometry between a point and one finite projectile segment without allocating native vectors or depending on renderer/runtime adapters.
 * Chochmah flashes the nearest place into measure while the Awtsmoos renews point, line, distance, and every mathematical shore;
 * Awtsmoos.com keeps this witness headless and exact, so combat pressure, damage, and tests may trust geometry without inheriting a rendering door.
 */

/**
 * Measures the shortest Euclidean distance from one point to a finite clamped projectile segment using scalar arithmetic only.
 * @param {{x:number,y:number,z:number}} chochmahPoint - Point whose proximity to the projectile path is being measured.
 * @param {{x:number,y:number,z:number}} chochmahSegmentStart - Segment start position in world coordinates.
 * @param {{x:number,y:number,z:number}} chochmahSegmentEnd - Segment end position in world coordinates.
 * @returns {number} Shortest finite-segment distance in world units.
 * @sideEffects None. The function allocates no native vector objects and mutates no caller data.
 * @invariant Projection is clamped to [0,1], preserving both endpoints as valid nearest points.
 */
export function measureSegmentDistance(
	chochmahPoint,
	chochmahSegmentStart,
	chochmahSegmentEnd
) {
	const netzachSegmentX = chochmahSegmentEnd.x - chochmahSegmentStart.x;
	const netzachSegmentY = chochmahSegmentEnd.y - chochmahSegmentStart.y;
	const netzachSegmentZ = chochmahSegmentEnd.z - chochmahSegmentStart.z;
	const gevurahLengthSquared = Math.max(
		0.000001,
		netzachSegmentX * netzachSegmentX
			+ netzachSegmentY * netzachSegmentY
			+ netzachSegmentZ * netzachSegmentZ
	);
	const chochmahFromStartX = chochmahPoint.x - chochmahSegmentStart.x;
	const chochmahFromStartY = chochmahPoint.y - chochmahSegmentStart.y;
	const chochmahFromStartZ = chochmahPoint.z - chochmahSegmentStart.z;
	const tiferesProjection = (
		chochmahFromStartX * netzachSegmentX
		+ chochmahFromStartY * netzachSegmentY
		+ chochmahFromStartZ * netzachSegmentZ
	) / gevurahLengthSquared;
	const gevurahClampedProjection = Math.max(0, Math.min(1, tiferesProjection));
	const malchusNearestX = chochmahSegmentStart.x + netzachSegmentX * gevurahClampedProjection;
	const malchusNearestY = chochmahSegmentStart.y + netzachSegmentY * gevurahClampedProjection;
	const malchusNearestZ = chochmahSegmentStart.z + netzachSegmentZ * gevurahClampedProjection;
	return Math.hypot(
		chochmahPoint.x - malchusNearestX,
		chochmahPoint.y - malchusNearestY,
		chochmahPoint.z - malchusNearestZ
	);
}
