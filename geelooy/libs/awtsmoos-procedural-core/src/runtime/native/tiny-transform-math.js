// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-transform-math.js
 * @description Direct quaternion and TRS composition for animated village forms.
 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
 * complete local vessel in one pass so no temporary translation or scale matrix is born.
 */

import { identity } from './tiny-matrix-core.js';

export function quatNormalize(quaternion) {
	const x = quaternion?.[0] || 0;
	const y = quaternion?.[1] || 0;
	const z = quaternion?.[2] || 0;
	const w = quaternion?.[3] ?? 1;
	const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
	return [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
}

export function quatMatrix(quaternion = [0, 0, 0, 1]) {
	const [x, y, z, w] = quatNormalize(quaternion);
	return composeNormalizedQuaternion(x, y, z, w, 0, 0, 0, 1, 1, 1);
}

export function composeTRS(position, quaternion, scaling) {
	const source = quaternion.toArray ? quaternion.toArray() : quaternion;
	const [x, y, z, w] = quatNormalize(source);
	return composeNormalizedQuaternion(
		x,
		y,
		z,
		w,
		position.x,
		position.y,
		position.z,
		scaling.x,
		scaling.y,
		scaling.z
	);
}

function composeNormalizedQuaternion(x, y, z, w, px, py, pz, sx, sy, sz) {
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
	const result = identity();
	result[0] = (1 - yy - zz) * sx;
	result[1] = (xy + wz) * sx;
	result[2] = (xz - wy) * sx;
	result[4] = (xy - wz) * sy;
	result[5] = (1 - xx - zz) * sy;
	result[6] = (yz + wx) * sy;
	result[8] = (xz + wy) * sz;
	result[9] = (yz - wx) * sz;
	result[10] = (1 - xx - yy) * sz;
	result[12] = px;
	result[13] = py;
	result[14] = pz;
	return result;
}
