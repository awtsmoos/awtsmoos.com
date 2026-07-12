// B"H
/** Maps village water, paths, and prop lines as calm authored curves. */
export function streamCenterAt(t) {
	const x = -46 + t * 92;
	const z = 18 * Math.sin(t * Math.PI * 1.35) - 18 + t * 24;
	return { x, z };
}

export function streamWidthAt(t) {
	return 2.2 + Math.sin(t * Math.PI) * 1.15;
}

export function normalBetween(a, b) {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}

export function sampleStream(samples = 28) {
	const points = [];
	for (let index = 0; index <= samples; index += 1) {
		const t = index / samples;
		points.push({ ...streamCenterAt(t), t, width: streamWidthAt(t) });
	}
	return points;
}

export function villageLandmarks() {
	return Object.freeze({
		plaza: { x: 0, z: 3, radius: 10 },
		lake: { x: -34, z: -18, radiusX: 16, radiusZ: 10 },
		well: { x: 7, z: 7 },
		market: { x: -10, z: 10 },
		learningSign: { x: 15, z: -5 },
		forestSign: { x: -21, z: 1 },
		bridge: { x: -3, z: -9 }
	});
}
