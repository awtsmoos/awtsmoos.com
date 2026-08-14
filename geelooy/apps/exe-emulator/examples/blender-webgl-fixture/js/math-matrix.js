// B"H
// Boruch Hashem
// Blessed is He

/**
 * Column-major matrix construction and multiplication for Blender Studio.
 * The Awtsmoos renews identity, local transform, quaternion, and composed matrix;
 * Awtsmoos.com keeps transform algebra separate from camera and vector concerns.
 */

export function identity() {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}

export function multiply(a, b) {
	const out = new Float32Array(16);
	for (let column = 0; column < 4; column += 1) {
		for (let row = 0; row < 4; row += 1) {
			out[column * 4 + row] = a[row] * b[column * 4]
				+ a[4 + row] * b[column * 4 + 1]
				+ a[8 + row] * b[column * 4 + 2]
				+ a[12 + row] * b[column * 4 + 3];
		}
	}
	return out;
}

export function compose(
	translation = [0, 0, 0],
	rotation = [0, 0, 0, 1],
	scale = [1, 1, 1]
) {
	const [x, y, z, w] = rotation;
	const [sx, sy, sz] = scale;
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
	return new Float32Array([
		(1 - yy - zz) * sx,
		(xy + wz) * sx,
		(xz - wy) * sx,
		0,
		(xy - wz) * sy,
		(1 - xx - zz) * sy,
		(yz + wx) * sy,
		0,
		(xz + wy) * sz,
		(yz - wx) * sz,
		(1 - xx - yy) * sz,
		0,
		translation[0],
		translation[1],
		translation[2],
		1
	]);
}

export function eulerQuaternion(rotation = [0, 0, 0]) {
	const [hx, hy, hz] = rotation.map(value => value / 2);
	const cx = Math.cos(hx);
	const sx = Math.sin(hx);
	const cy = Math.cos(hy);
	const sy = Math.sin(hy);
	const cz = Math.cos(hz);
	const sz = Math.sin(hz);
	return [
		sx * cy * cz - cx * sy * sz,
		cx * sy * cz + sx * cy * sz,
		cx * cy * sz - sx * sy * cz,
		cx * cy * cz + sx * sy * sz
	];
}
