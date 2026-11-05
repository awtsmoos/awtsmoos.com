// B"H
/** Measures all footprint corners without making HouseSpec own terrain policy. */
export function measureHouseGround(specification, sampler) {
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
	const samples = corners.map(([localX, localZ]) => {
		const point = localToWorld(specification, localX, localZ);
		return sampler.heightAt(point.x, point.z);
	});
	return {
		floorY: Math.max(...samples.map((sample) => sample.y)),
		groundMin: Math.min(...samples.map((sample) => sample.y)),
		groundEvidence: samples.map((sample) => sample.source)
	};
}

function localToWorld(specification, localX, localZ) {
	const cosine = Math.cos(specification.yaw);
	const sine = Math.sin(specification.yaw);
	return {
		x: specification.x + localX * cosine - localZ * sine,
		z: specification.z + localX * sine + localZ * cosine
	};
}
