// B"H
export const CAMERA_PROFILES = Object.freeze({
	outdoor: Object.freeze({ maxDistance: 220, targetLift: 0, pitchBias: 0, minSafe: 0.75 }),
	indoor: Object.freeze({ maxDistance: 10.5, targetLift: 1.05, pitchBias: -0.04, minSafe: 0.9 }),
	stairs: Object.freeze({ maxDistance: 8.5, targetLift: 1.55, pitchBias: 0.08, minSafe: 1.05 })
});

/** Resolves camera mode from measured house and stair metadata. */
export function resolveCameraContext(state, houses = [], stairs = []) {
	for (const house of houses) {
		const local = worldToHouse(house, state.x, state.z);
		const inside = Math.abs(local.x) < house.width / 2 - house.wallThickness
			&& Math.abs(local.z) < house.depth / 2 - house.wallThickness
			&& state.y >= house.floorY - 0.5
			&& state.y <= house.floorY + house.wallHeight + 2;
		if (!inside) {
			continue;
		}
		const activeFloor = Math.max(0, Math.min(
			house.floors - 1,
			Math.floor((state.y - house.floorY) / house.storyHeight)
		));
		const stair = stairs.find((layout) => layout.houseId === house.id && containsStair(layout, local));
		return {
			mode: stair ? 'stairs' : 'indoor',
			profile: CAMERA_PROFILES[stair ? 'stairs' : 'indoor'],
			activeHouse: house.id,
			activeFloor,
			local,
			stairId: stair?.id || null
		};
	}
	return {
		mode: 'outdoor',
		profile: CAMERA_PROFILES.outdoor,
		activeHouse: null,
		activeFloor: null,
		local: null,
		stairId: null
	};
}

function containsStair(layout, local) {
	const zValues = layout.steps.map((step) => step.centerZ);
	zValues.push(layout.lowerLanding.centerZ);
	const minimumZ = Math.min(...zValues) - layout.treadDepth;
	const maximumZ = Math.max(...zValues) + layout.lowerLanding.depth / 2;
	return Math.abs(local.x - layout.opening.centerX) <= layout.width / 2 + 1.1
		&& local.z >= minimumZ
		&& local.z <= maximumZ;
}

function worldToHouse(house, x, z) {
	const dx = x - house.x;
	const dz = z - house.z;
	const cosine = Math.cos(house.yaw);
	const sine = Math.sin(house.yaw);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}
