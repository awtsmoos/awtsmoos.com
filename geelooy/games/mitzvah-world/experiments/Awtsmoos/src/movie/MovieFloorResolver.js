// B"H
/**
 * @file MovieFloorResolver.js
 * @description Resolves actor feet without mistaking roofs, tables, or stairs for ground.
 */
function houseContains(house, x, z, margin = 1) {
	const cosine = Math.cos(-Number(house.yaw || 0));
	const sine = Math.sin(-Number(house.yaw || 0));
	const dx = x - Number(house.x || 0);
	const dz = z - Number(house.z || 0);
	const localX = dx * cosine - dz * sine;
	const localZ = dx * sine + dz * cosine;
	return Math.abs(localX) <= Number(house.width || 0) / 2 - margin
		&& Math.abs(localZ) <= Number(house.depth || 0) / 2 - margin;
}

export function movieFloorAt(runtime, x, z) {
	const houses = runtime.terrain?.stats?.houseStats?.houses || [];
	const house = houses.find((item) => houseContains(item, x, z));
	if (house && Number.isFinite(Number(house.floorY))) {
		return {
			y: Number(house.floorY) + .2,
			kind: `${house.id}-movie-floor`,
			source: 'house-floor-metadata',
			houseId: house.id
		};
	}
	const terrainHeightAt = runtime.groundSampler?.terrainHeightAt;
	if (typeof terrainHeightAt !== 'function') {
		throw new Error('Movie floor resolver requires groundSampler.terrainHeightAt.');
	}
	return {
		y: terrainHeightAt(x, z),
		kind: 'terrain',
		source: 'terrain-height',
		houseId: null
	};
}

export { houseContains };
export default movieFloorAt;
