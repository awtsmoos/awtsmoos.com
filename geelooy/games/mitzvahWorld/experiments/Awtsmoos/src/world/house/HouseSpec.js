// B"H
export const PLAYER_CAPSULE = Object.freeze({ radius: 0.38, height: 1.72 });

export const HOUSE_ARCHITECTURE = Object.freeze({
	floorThickness: 0.2,
	storyHeight: 9.2,
	doorWidth: 3.1,
	doorHeight: 3.8,
	wallThickness: 0.9,
	roofClearance: 0.8
});

export const DEFAULT_HOUSE_SPEC = Object.freeze({
	id: 'Awtsmoos-main-house',
	x: 58,
	z: -64,
	yaw: 0,
	width: 60,
	depth: 46,
	wallH: 19.2,
	wallT: HOUSE_ARCHITECTURE.wallThickness,
	doorW: HOUSE_ARCHITECTURE.doorWidth,
	doorH: HOUSE_ARCHITECTURE.doorHeight,
	roofRise: 8,
	roofOver: 3.4,
	floors: 2,
	fence: true,
	storyHeight: HOUSE_ARCHITECTURE.storyHeight,
	floorThickness: HOUSE_ARCHITECTURE.floorThickness
});

/** Measures terrain and enforces enough vertical room for every story. */
export function resolveHouseSpec(specification = {}, sampler) {
	const merged = { ...DEFAULT_HOUSE_SPEC, ...specification };
	const floors = Math.max(1, Math.round(merged.floors || 1));
	const storyHeight = Math.max(8.8, merged.storyHeight || HOUSE_ARCHITECTURE.storyHeight);
	const floorThickness = merged.floorThickness || HOUSE_ARCHITECTURE.floorThickness;
	const minimumWallHeight = floors * storyHeight + HOUSE_ARCHITECTURE.roofClearance;
	const measured = measureGround(merged, sampler);
	return Object.freeze({
		...merged,
		...measured,
		floors,
		storyHeight,
		floorThickness,
		wallH: Math.max(merged.wallH || 0, minimumWallHeight),
		doorW: Math.max(merged.doorW || 0, HOUSE_ARCHITECTURE.doorWidth),
		doorH: Math.max(merged.doorH || 0, HOUSE_ARCHITECTURE.doorHeight)
	});
}

export function floorBottomY(specification, level) {
	return specification.floorY + level * specification.storyHeight;
}

export function floorTopY(specification, level) {
	return floorBottomY(specification, level) + specification.floorThickness;
}

export function storyCeilingY(specification, level) {
	if (level + 1 < specification.floors) {
		return floorBottomY(specification, level + 1);
	}
	return specification.floorY + specification.wallH;
}

export function localToWorld(specification, localX, localZ) {
	const cosine = Math.cos(specification.yaw);
	const sine = Math.sin(specification.yaw);
	return {
		x: specification.x + localX * cosine - localZ * sine,
		z: specification.z + localX * sine + localZ * cosine
	};
}

export function worldToLocal(specification, x, z) {
	const dx = x - specification.x;
	const dz = z - specification.z;
	const cosine = Math.cos(specification.yaw);
	const sine = Math.sin(specification.yaw);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}

export function houseBasis(yaw) {
	const cosine = Math.cos(yaw);
	const sine = Math.sin(yaw);
	return Object.freeze({
		right: Object.freeze({ x: cosine, y: 0, z: sine }),
		entryRight: Object.freeze({ x: -cosine, y: 0, z: -sine }),
		outward: Object.freeze({ x: -sine, y: 0, z: cosine }),
		inward: Object.freeze({ x: sine, y: 0, z: -cosine }),
		up: Object.freeze({ x: 0, y: 1, z: 0 })
	});
}

function measureGround(specification, sampler) {
	const fallback = specification.floorY ?? 0;
	if (!sampler) {
		return { floorY: fallback, groundMin: fallback, groundEvidence: [] };
	}
	const corners = [
		[-specification.width / 2, -specification.depth / 2],
		[specification.width / 2, -specification.depth / 2],
		[-specification.width / 2, specification.depth / 2],
		[specification.width / 2, specification.depth / 2]
	];
	const samples = corners.map(([x, z]) => {
		const point = localToWorld(specification, x, z);
		return sampler.heightAt(point.x, point.z);
	});
	return {
		floorY: Math.max(...samples.map((sample) => sample.y)),
		groundMin: Math.min(...samples.map((sample) => sample.y)),
		groundEvidence: samples.map((sample) => sample.source)
	};
}
