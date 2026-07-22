// B"H
// Boruch Hashem
// Blessed is He

/**
 * Small deterministic math vessels keep the public legacy geometry builder
 * readable. The Awtsmoos.com helpers allocate only returned vectors and never
 * own tree structure, random streams, geometry buffers, or renderer state.
 */

export function normalizeTreeColor(value) {
	if (Array.isArray(value)) {
		return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
	}
	if (Number.isFinite(Number(value))) {
		return [
			((value >> 16) & 255) / 255,
			((value >> 8) & 255) / 255,
			(value & 255) / 255,
			1
		];
	}
	return [1, 1, 1, 1];
}

export function treeQuaternionBasis(quaternion) {
	const [x, y, z, w] = quaternion;
	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;
	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;
	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;
	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;
	return {
		right: [1 - (yy + zz), xy + wz, xz - wy],
		forward: [xz + wy, yz - wx, 1 - (xx + yy)],
		up: [xy - wz, 1 - (xx + zz), yz + wx]
	};
}

export function rotateTreeEuler(vector, rotation) {
	let [x, y, z] = vector;
	const [rx, ry, rz] = rotation;
	const cx = Math.cos(rx);
	const sx = Math.sin(rx);
	const cy = Math.cos(ry);
	const sy = Math.sin(ry);
	const cz = Math.cos(rz);
	const sz = Math.sin(rz);
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	[x, z] = [x * cy + z * sy, -x * sy + z * cy];
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	return [x, y, z];
}

export function treeNormalFromEuler(rotation) {
	const normal = rotateTreeEuler([0, 0, 1], rotation);
	const length = Math.hypot(...normal) || 1;
	return normal.map((value) => value / length);
}
