// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverPath.js
 * @description Authors one mountain-to-lake-to-valley river spine.
 * The Awtsmoos gathers distant springs into one living course; Awtsmoos.com lets
 * every waterfall, bridge, reed, foam line, and shoreline inherit the same path.
 */

const CONTROL_POINTS = Object.freeze([
	Object.freeze([64, 48]),
	Object.freeze([52, 40]),
	Object.freeze([39, 29]),
	Object.freeze([27, 18]),
	Object.freeze([14, 9]),
	Object.freeze([1, -1]),
	Object.freeze([-13, -10]),
	Object.freeze([-23, -15]),
	Object.freeze([-34, -18]),
	Object.freeze([-49, -21]),
	Object.freeze([-62, -29]),
	Object.freeze([-78, -41])
]);

export const RIVER_LAKE_T = 8 / (CONTROL_POINTS.length - 1);

export function riverCenterAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const scaled = clamped * (CONTROL_POINTS.length - 1);
	const index = Math.min(CONTROL_POINTS.length - 2, Math.floor(scaled));
	const local = scaled - index;
	const p0 = CONTROL_POINTS[Math.max(0, index - 1)];
	const p1 = CONTROL_POINTS[index];
	const p2 = CONTROL_POINTS[index + 1];
	const p3 = CONTROL_POINTS[Math.min(CONTROL_POINTS.length - 1, index + 2)];
	return {
		x: catmullRom(p0[0], p1[0], p2[0], p3[0], local),
		z: catmullRom(p0[1], p1[1], p2[1], p3[1], local)
	};
}

export function riverWidthAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const lakeBroadening = Math.exp(-Math.pow((clamped - RIVER_LAKE_T) / 0.13, 2)) * 2.2;
	const naturalPulse = Math.sin(clamped * Math.PI * 3.2) * 0.32;
	return 2.7 + lakeBroadening + naturalPulse + clamped * 0.45;
}

export function sampleRiverPath(samples = 56) {
	const count = Math.max(8, Math.floor(samples));
	return Array.from({ length: count + 1 }, (_, index) => {
		const t = index / count;
		return { ...riverCenterAt(t), t, width: riverWidthAt(t) };
	});
}

function catmullRom(a, b, c, d, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return 0.5 * (
		2 * b
		+ (-a + c) * t
		+ (2 * a - 5 * b + 4 * c - d) * t2
		+ (-a + 3 * b - 3 * c + d) * t3
	);
}
